var util = require('util')
var fs = require('fs')
var Narcissus = require('./narcissus')
var tokens = Narcissus.definitions.tokens
var pp = Narcissus.decompiler.pp

/*console.log(Narcissus.definitions.consts)*/
eval(Narcissus.definitions.consts);

var snippets = require('./snippets')
var idents = require('./idents')

exports.transformFile = function(filename) {
    idents.reset()

    var source = fs.readFileSync(filename, 'utf8');

    var n = Narcissus.parser.parse(source)
    strip(n)
    fs.writeFileSync(filename + '-before.json', JSON.stringify(n), 'utf8')

    var n = Narcissus.parser.parse(source)
    n.children.push(snippets.helpers())
    scan_for_functions(n).forEach(transform_function)
    var transformed = pp(n) + '\n'
    strip(n)
    fs.writeFileSync(filename + '-after.json', JSON.stringify(n), 'utf8')
    return transformed
}

exports.transform = function(source) {
    idents.reset()

    var n = Narcissus.parser.parse(source)
    n.children.push(snippets.helpers(idents.throw))
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
        idents.push_callback()
        func.name = strip_underscore(func.name)
        func.params.push(idents.callback.value)
        func.body.children.push({
            type: RETURN,
            implicit: true,
        })
        func.body.children = transform_statements(func.body.children)
        func.body.children.unshift(snippets.callback_or_throw(idents.throw))
        idents.pop_callback()
    }
}

function transform_statements(statements) {
    var statement = statements.shift()
    if (!statement) return []
    
    return transform_statement(statement, statements)
}

function transform_statement(statement, statements) {
    var transformation = transformations[tokens[statement.type]]
    if (transformation) {
        var transformed = transformation(statement, statements)
        if (transformed) {
            return transformed
        }
    } else {
        //util.debug('ignoring ' + tokens[statement.type] + ': ' + pp(statement))
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
        ]
    },

    'return': function(statement, statements) {
        if (!statement.value) {
            return [
                snippets.return_callback_null()
            ]
        }

        if (contains_streamlined_function_call(statement.value)) {
            return transform_streamlined_function_call_in_expression(statement.value, statement, statements)
        }

        if (contains_regular_function_call(statement.value.children)) {
            var ident = idents.get('retval')
            
            return [
                snippets.try_catch_return_callback_err(
                    snippets.assign(ident, statement.value)
                ),
                snippets.return_callback_value(ident),
            ]
        }

        return [
            snippets.return_callback_value(statement.value)
        ]
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
        if (is_streamlined_function_call(statement.expression)) {
            return transform_streamlined_function_call_statement(statement.expression, statement, statements)
        }

        if (contains_streamlined_function_call(statement.expression)) {
            return transform_streamlined_function_call_in_expression(statement.expression, statement, statements)
        }
    },

    'if': function(statement, statements) {
        if (contains_streamlined_function_call(statement.condition)) {
            return transform_streamlined_function_call_in_expression(statement.condition, statement, statements)
        }

        var then_block_ident = idents.get('then_block')
        if (statement.elsePart) {
            var else_block_ident = idents.get('else_block')
        }
        var rest_block_ident = idents.get('rest_block')

        var then_func = snippets.function(then_block_ident, [], transform_statements(
            statement.thenPart.children.concat([
                snippets.call(rest_block_ident, [])
            ])
        ))
        if (statement.elsePart) {
            var else_func = snippets.function(else_block_ident, [], transform_statements(
                statement.elsePart.children.concat([
                    snippets.call(rest_block_ident, [])
                ])
            ))
        }
        var rest_func = snippets.function(rest_block_ident, [], transform_statements(statements))
        
        var result = [
            snippets.if(
                statement.condition,
                [snippets.call(then_block_ident, [])],
                [snippets.call(statement.elsePart ? else_block_ident : rest_block_ident, [])]
            )
        ]
        result.push(then_func)
        if (statement.elsePart) {
            result.push(else_func)
        }
        result.push(rest_func)
        return result
    },

    'break': function(statement, statements) {
        if (!statement.target.rest_ident) {
            throw new Error('break has no target')
        }
        return [{
            type: RETURN,
            value: snippets.call(statement.target.rest_ident, [])
        }]
    },

    'while': function(statement, statements) {
        var ident = statement.ident || idents.get('while_loop')
        statement.rest_ident = idents.get('rest')

        return [
            snippets.call(ident, []),
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
                            children: statement.body.children.concat([
                                snippets.nextTick(ident)
                            ])
                        },
                        elsePart: {
                            type: BLOCK,
                            children: [
                                snippets.call(statement.rest_ident, [])
                            ]
                        }
                    }])
                }
            },
            snippets.function(statement.rest_ident, [], transform_statements(statements))
        ]
    },

    'switch': function(statement, statements) {
        if (contains_streamlined_function_call(statement.discriminant)) {
            return transform_streamlined_function_call_in_expression(statement.discriminant, statement, statements)
        }

        var case_idents = []
        for (var i in statement.cases) {
            case_idents.push(idents.get('case'))
        }

        var rest_ident = idents.get('rest')

        var case_funcs = []

        for (var i in statement.cases) {
            var this_ident = case_idents[parseInt(i)]
            var next_ident = case_idents[parseInt(i) + 1] || rest_ident

            var children = statement.cases[i].statements.children
            statement.cases[i].statements.children = [{
                type: RETURN,
                value: snippets.call(this_ident, [])
            }]

            children.push(snippets.call(next_ident, []))

            for (var j in children) {
                if (children[j].type === BREAK) {
                    children.splice(j, children.length, snippets.call(rest_ident, []))
                }
            }

            var case_func = snippets.function(case_idents[i], [], transform_statements(children))
            case_funcs.push(case_func)
        }

        var rest_func = snippets.function(rest_ident, [], transform_statements(statements))

        return [
            statement,
            snippets.call(rest_ident, [])
        ].concat(case_funcs).concat([rest_func])
    },

    'try': function(statement, statements) {
        var try_block_ident = idents.get('try_block')
        var catch_block_ident = idents.get('catch_block')
        var finally_block_ident = idents.get('finally_block')
        var rest_block_ident = idents.get('rest_block')

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
        if (statement.setup.type !== VAR) {
            statement.setup = {
                type: SEMICOLON,
                expression: statement.setup,
            }
        }
        return transform_statements([
            statement.setup,
            {
                type: WHILE,
                ident: idents.get('for_loop'),
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

    'FOR_IN': function(statement, statements) {
        if (contains_streamlined_function_call(statement.object)) {
            return transform_streamlined_function_call_in_expression(statement.object, statement, statements)
        }

        var children = statement.body.children

        var props_ident = idents.get('props')
        var iter_ident = idents.get('i')
        
        statement.body.children = [
            {
                type: SEMICOLON,
                expression: snippets.call({
                    type: DOT,
                    children: [ props_ident, snippets.ident('push') ]
                }, [statement.iterator])
            }
        ]

        var for_statement = {
            type: FOR,
            setup: snippets.var(iter_ident, snippets.number(0)),
            condition: snippets.less_than(iter_ident, {
                type: DOT,
                children: [ props_ident, snippets.ident('length') ]
            }),
            update: {
                type: INCREMENT,
                children: [iter_ident],
            },
            body: {
                type: BLOCK,
                children: [
                    snippets.assign(statement.iterator, {
                        type: INDEX,
                        children: [ props_ident, iter_ident ]
                    })
                ].concat(children)
            },
        }

        return [
            snippets.var(props_ident, snippets.array([])),
            statement,
        ].concat(transform_statement(for_statement, statements))
    },
}

function transform_streamlined_function_call_statement(call, statement, statements) {
    strip_call_underscore(call)
    var name_ident = call.children[0]
    var call_parameters = call.children[1].children

    return [{
        type: CALL,
        children: [
            name_ident,
            {
                type: LIST,
                children: call_parameters.concat([
                    (statements.length === 0 || (statements.length === 1 && statements[0].implicit))
                    ? idents.callback
                    : snippets.function_err(transform_statements(statements))
                ])
            }
        ]
    }]
}

function transform_streamlined_function_call_in_expression(expression, statement, statements) {
    var ident = idents.get('result')

    var call = find_streamlined_function_call(expression)

    strip_call_underscore(call)
    var name_ident = call.children[0]
    var call_parameters = call.children[1].children

    call.type = IDENTIFIER
    call.value = ident.value
    delete call.children

    return [{
        type: RETURN,
        value: {
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
        }
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
        delete n.target // break -> switch
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
        if (n.varDecl)      scan(n.varDecl)
        if (n.object)       scan(n.object)
        if (n.iterator)     scan(n.iterator)
        
    }
    scan(tree)
}
