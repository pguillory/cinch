var util = require('util')
var fs = require('fs')
var Narcissus = require('./narcissus')
var tokens = Narcissus.definitions.tokens
var pp = Narcissus.decompiler.pp

/*console.log(Narcissus.definitions.consts)*/
eval(Narcissus.definitions.consts);

var snippets = require('./snippets')

var ident_counter = 0
function get_ident(name) {
    ident_counter += 1
    return {
        type: IDENTIFIER,
        value: '__' + (name || 'ident') + '_' + ident_counter,
    }
}

var throw_ident

exports.transformFile = function(filename) {
    ident_counter = 0
    throw_ident = get_ident('throw')

    var source = fs.readFileSync(filename, 'utf8');

    var n = Narcissus.parser.parse(source)
    strip(n)
    fs.writeFileSync(filename + '-before.json', JSON.stringify(n), 'utf8')

    var n = Narcissus.parser.parse(source)
    n.children.push(snippets.helpers(throw_ident))
    scan_for_functions(n).forEach(transform_function)
    var transformed = pp(n) + '\n'
    strip(n)
    fs.writeFileSync(filename + '-after.json', JSON.stringify(n), 'utf8')
    return transformed
}

exports.transform = function(source) {
    ident_counter = 0
    throw_ident = get_ident('throw')

    var n = Narcissus.parser.parse(source)
    n.children.push(snippets.helpers(throw_ident))
    scan_for_functions(n).forEach(transform_function)
    var transformed = pp(n) + '\n'
    return transformed
}

function dump(n) {
    strip(n)
    fs.writeFileSync('dump.json', JSON.stringify(n), 'utf8')
}

function scan_for_functions(script) {
    var functions = []
    uscan(script.children, function(n) {
        if (is_streamlined_function_definition(n)) {
            functions.push(n)
        }
    })
    return functions
}

function transform_function(func) {
    if (ends_with_underscore(func.name)) {
        //console.log('transforming function ' + func.name)

        func.name = strip_underscore(func.name)
        func.params.push('callback')
        if (!func.body.hasReturnWithValue) {
            func.body.children.push({
                type: RETURN,
            })
        }
        func.body.children = transform_statements(func.body.children)
        func.body.children.unshift(snippets.callback_or_throw(throw_ident))
    }
}

function transform_statements(statements) {
    var statement = statements.shift()
    if (!statement) return []
    
    return transform_statement(statement, statements)
}

function transform_statement(statement, statements) {
    //console.log('type: ' + tokens[statement.type])
    var transformation = transformations[tokens[statement.type]]
    if (transformation) {
        //console.log('found transformation')
        var transformed = transformation(statement, statements)
        if (transformed) {
            return transformed
        }
    } else {
        //util.debug('ignoring statement of type ' + tokens[statement.type] + ': ' + pp(statement))
    }
    return [statement].concat(transform_statements(statements))
}

var transformations = {
    'throw': function(statement, statements) {
        if (contains_streamlined_function_call(statement.exception)) {
            return transform_streamlined_function_call_in_expression(statement.exception, statement, statements)
        }

        return [
            snippets.return_callback(statement.exception)
        ].concat(transform_statements(statements))
    },

    'return': function(statement, statements) {
        if (!statement.value) {
            return [
                snippets.return_callback_null()
            ].concat(transform_statements(statements))
        }

        if (contains_streamlined_function_call(statement.value)) {
            return transform_streamlined_function_call_in_expression(statement.value, statement, statements)
        }

        if (contains_regular_function_call(statement.value.children)) {
            var ident = get_ident('retval')
            
            return [
                snippets.try_catch_return_callback_err(
                    snippets.assign(ident, statement.value)
                ),
                snippets.return_callback_value(ident),
            ].concat(transform_statements(statements))
        }

        return [
            snippets.return_callback_value(statement.value)
        ].concat(transform_statements(statements))
    },
    
    'var': function(statement, statements) {
        for (var i in statement.children) {
            var expression = statement.children[i].initializer
            if (!expression) continue
            if (contains_streamlined_function_call(expression)) {
                return transform_streamlined_function_call_in_expression(expression, statement, statements)
            }
        }
    },

    ';': function(statement, statements) {
        if (contains_streamlined_function_call(statement.expression)) {
            return transform_streamlined_function_call_in_expression(statement.expression, statement, statements)
        }
    },
    
    'if': function(statement, statements) {
        if (contains_streamlined_function_call(statement.condition)) {
            return transform_streamlined_function_call_in_expression(statement.condition, statement, statements)
        }

        if (statement.thenPart) {
            statement.thenPart.children = transform_statements(statement.thenPart.children)
        }
        if (statement.elsePart) {
            statement.elsePart.children = transform_statements(statement.elsePart.children)
        }
    },
    
    'while': function(statement, statements) {
        var ident = get_ident('while_loop')

        var call_next = snippets.nextTick(ident)

        return [
            call_next,
            {
                type: FUNCTION,
                name: ident.value,
                params: [],
                body: {
                    type: SCRIPT,
                    children: transform_statements([{
                        type: IF,
                        condition: statement.condition,
                        thenPart: {
                            type: BLOCK,
                            children: statement.body.children.concat([call_next])
                        },
                        elsePart: {
                            type: BLOCK,
                            children: statements
                        },
                    }])
                }
            }
        ]
    },

    'switch': function(statement, statements) {
        if (contains_streamlined_function_call(statement.discriminant)) {
            return transform_streamlined_function_call_in_expression(statement.discriminant, statement, statements)
        }

        for (var i in statement.cases) {
            var block = statement.cases[i].statements
            block.children = transform_statements(block.children)
        }
    },

    'try': function(statement, statements) {
        var try_block_ident = get_ident('try_block')
        var catch_block_ident = get_ident('catch_block')
        var finally_block_ident = get_ident('finally_block')
        var rest_block_ident = get_ident('rest_block')

        var result = [
            snippets.call(try_block_ident, [])
        ]

        var func = snippets.function(
            try_block_ident,
            [],
            transform_statements(
                snippets.try_prefix(catch_block_ident)
                .concat(statement.tryBlock.children)
                .concat([
                    snippets.call(statement.finallyBlock ? finally_block_ident : rest_block_ident, [])
                ])
            )
        )
        result.push(func)
        
        for (var i in statement.catchClauses) {
            var clause = statement.catchClauses[i]
            var func = snippets.function(
                catch_block_ident,
                [clause.varName],
                transform_statements(clause.block.children.concat([
                    snippets.call(statement.finallyBlock ? finally_block_ident : rest_block_ident, [])
                ]))
            )
            result.push(func)
        }

        if (statement.finallyBlock) {
            var func = snippets.function(
                finally_block_ident,
                [],
                transform_statements(statement.finallyBlock.children.concat([
                    snippets.call(rest_block_ident, [])
                ]))
            )
            result.push(func)
        }

        var func = snippets.function(
            rest_block_ident,
            [],
            transform_statements(statements)
        )
        result.push(func)

        return result
    },
    
    'for': function(statement, statements) {
        return transform_statements([
            {
                type: SEMICOLON,
                expression: statement.setup,
            },
            {
                type: WHILE,
                condition: statement.condition,
                body: {
                    type: BLOCK,
                    children: statement.body.children.concat([
                        {
                            type: SEMICOLON,
                            expression: statement.update
                        }
                    ])
                }
            }
        ].concat(statements))
    },
}

function transform_streamlined_function_call_in_expression(expression, statement, statements) {
    var ident = get_ident('result')

    var call = find_streamlined_function_call(expression)

    strip_call_underscore(call)
    var name_ident = call.children[0]
    var call_parameters = call.children[1].children

    call.type = IDENTIFIER
    call.value = ident.value
    delete call.children

    return [{
        type: CALL,
        children: [
            name_ident,
            {
                type: LIST,
                children: call_parameters.concat([
                    snippets.function_err_result(ident, transform_statement(statement, statements))
                ])
            }
        ]
    }]
}

function is_streamlined_function_definition(expression) {
    return (
        expression.type &&
        expression.type === FUNCTION &&
        expression.name &&
        ends_with_underscore(expression.name)
    )
}

function is_streamlined_function_call(n) {
    return (
        n.type === CALL &&
        ends_with_underscore(call_name(n))
    )
}

function call_name(n) {
    if (n.children[0].type === IDENTIFIER) {
        return n.children[0].value
    }
    if (n.children[0].type === DOT) {
        return n.children[0].children[1].value
    }
    throw new Error('Can not find name of function called')
}

function contains_streamlined_function_call(n) {
    if (is_streamlined_function_call(n)) {
        return true
    }

    for (var i in n.children) {
        if (contains_streamlined_function_call(n.children[i])) {
            return true
        }
    }

    return false
}

function find_streamlined_function_call(n) {
    if (is_streamlined_function_call(n)) {
        return n
    }

    for (var i in n.children) {
        var call = find_streamlined_function_call(n.children[i])
        if (call) return call
    }

    return null
}

function is_regular_function_call(n) {
    return (
        n.type === CALL &&
        n.children[0].type === IDENTIFIER &&
        !ends_with_underscore(n.children[0].value)
    )
}

function contains_regular_function_call(children) {
    for (var i in children) {
        var n = children[i]
        if (is_regular_function_call(n)) {
            return true
        }
        if (contains_regular_function_call(n.children)) {
            return true
        }
    }
    return false
}

function find_regular_function_call(children) {
    for (var i in children) {
        var n = children[i]
        if (is_regular_function_call(n)) {
            return {
                n: n,
                children: children,
                i: i,
            }
        }
        var result = find_regular_function_call(n.children)
        if (result) return result
    }
    return null
}

function strip_call_underscore(n) {
    if (n.children[0].type === IDENTIFIER) {
        n.children[0].value = strip_underscore(n.children[0].value)
    }
    if (n.children[0].type === DOT) {
        n.children[0].children[1].value = strip_underscore(n.children[0].children[1].value)
    }
}

function ends_with_underscore(s) {
    return (s[s.length - 1] === '_')
}

function strip_underscore(s) {
    if (!ends_with_underscore(s)) throw new Error('thought that had an underscore')
    return s.slice(0, s.length - 1)
}

function strip(tree) {
    uscan(tree, function(n) {
        delete n.tokenizer
        delete n.lineno
        delete n.start
        delete n.end
        if (typeof n.type === 'number') n.type = tokens[n.type] + '(' + n.type + ')'
    })
}

function uscan(tree, f) {
    var scan = function(n) {
        if (!n) return

        f(n)

        if (n.forEach)      n.forEach(scan)
        if (n.children)     n.children.forEach(scan)
        if (n.funDecls)     n.funDecls.forEach(scan)
        if (n.catchClauses) n.catchClauses.forEach(scan)
        if (n.cases)        n.cases.forEach(scan)
        
        if (n.initializer)  scan(n.initializer)
        if (n.body)         scan(n.body)
        if (n.expression)   scan(n.expression)
        if (n.condition)    scan(n.condition)
        if (n.thenPart)     scan(n.thenPart)
        if (n.elsePart)     scan(n.elsePart)
        if (n.value)        scan(n.value)
        if (n.block)        scan(n.block)
        if (n.tryBlock)     scan(n.tryBlock)
        if (n.exception)    scan(n.exception)
        if (n.discriminant) scan(n.discriminant)
        if (n.caseLabel)    scan(n.caseLabel)
        if (n.statements)   scan(n.statements)
        if (n.setup)        scan(n.setup)
        if (n.update)       scan(n.update)
        
    }
    scan(tree)
}
