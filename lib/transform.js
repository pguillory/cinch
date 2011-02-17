var util = require('util')
var fs = require('fs')
var Narcissus = require('./narcissus')
var tokens = Narcissus.definitions.tokens
var pp = Narcissus.decompiler.pp

/*console.log(Narcissus.definitions.consts)*/
eval(Narcissus.definitions.consts);

var snippets = require('./snippets')

var get_ident = (function() {
    var i = 0
    return function() {
        i += 1
        return {
            type: IDENTIFIER,
            value: 'result' + i,
        }
    }
})()

exports.transformFile = function(filename) {
    var source = fs.readFileSync(filename, 'utf8');

    var n = Narcissus.parser.parse(source)
    strip(n)
    fs.writeFileSync(filename + '-before.json', JSON.stringify(n), 'utf8')

    var n = Narcissus.parser.parse(source)
    scan_for_functions(n).forEach(transform_function)
    var transformed = pp(n) + '\n'
    strip(n)
    fs.writeFileSync(filename + '-after.json', JSON.stringify(n), 'utf8')
    return transformed
}

exports.transform = function(source) {
    var n = Narcissus.parser.parse(source)
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
    var funDecls = func.body.funDecls

    if (ends_with_underscore(func.name)) {
        console.log('transforming function ' + func.name)
        func.name = strip_underscore(func.name)
        func.params.push('callback')
        if (!func.body.hasReturnWithValue) {
            func.body.children.push({
                type: RETURN,
            })
        }
        func.body.children = transform_statements(func.body.children)
    }
}

function is_streamlined_function_definition(expression) {
    return (
        expression.type &&
        expression.type === FUNCTION &&
        expression.name &&
        ends_with_underscore(expression.name)
    )
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
        return transformation(statement, statements)
    } else {
        util.debug('ignoring statement: ' + tokens[statement.type])
        return [statement].concat(transform_statements(statements))
    }
}

var transformations = {
    'throw': function(statement, statements) {
        return [
            snippets.return_callback(statement.exception)
        ]
    },

    'return': function(statement, statements) {
        if (!statement.value) {
            // return => return callback(null)

            return [
                snippets.return_callback_null()
            ] 
        }

        if (is_streamlined_function_call(statement.value)) {
            // return foo_() => return foo(callback)

            statement.value.children[0].value = strip_underscore(statement.value.children[0].value)
            statement.value.children[1].children.push({
                type: IDENTIFIER,
                value: 'callback',
            })
            return [statement]
        }

        if (contains_streamlined_function_call(statement.value.children)) {
            var ident = get_ident()

            var found = find_streamlined_function_call(statement.value.children)
            found.children[found.i] = ident

            var callback = snippets.function_err_result(ident, transform_statements([{
               type: RETURN,
               value: statement.value,
            }]))
            found.n.children[0].value = strip_underscore(found.n.children[0].value)
            found.n.children[1].children.push(callback)

            statement.value = found.n
            return [statement]
        }

        if (contains_regular_function_call(statement.value.children)) {
            var ident = get_ident()
            
            var found = find_regular_function_call(statement.value.children)
            var try_catch = snippets.try_catch_return_callback_err(
                snippets.assign(ident, statement.value)
            )

            return [
                try_catch,
                snippets.return_callback_value(ident),
            ].concat(transform_statements(statements))
        }

        return [snippets.return_callback_value(statement.value)]
    },
    
    'var': function(statement, statements) {
        for (var i in statement.children) {
            var expression = statement.children[i].initializer

        }
        return [statement].concat(transform_statements(statements))
    },
    
    ';': function(statement, statements) {
        //util.debug('semicolon: ' + pp(statement))
        return [statement].concat(transform_statements(statements))
    },
}


/*
    switch () {
        case SEMICOLON:
            if (contains_streamlined_function_call(statement.children)) {
                console.log('semicolon contains_streamlined_function_call')
                var ident = get_ident()

                var statements_left = statements.splice(parseInt(i) + 1)
                var found = find_streamlined_function_call(statement.children)
                found.children[found.i] = ident
                var callback = snippets.function_err_result(ident)
                transform_statements(statements_left)
                statements_left.forEach(function(child) {
                    callback.body.children.push(child)
                })
                found.n.children[0].value = strip_underscore(found.n.children[0].value)
                found.n.children[1].children.push(callback)

                statement.value = found.n
            }
            break
        case FUNCTION:
            util.debug('function: ' + statement.name)
            transform_function(statement)
            break
        case CALL:
            if (is_streamlined_function_call(statement)) {
                transform_call(statement)
            }
            console.log('call to ' + statement.children[0].value)
            break
        case TRY:
            transform_statements(statement.tryBlock.children)
            statement.catchClauses.forEach(function(clause) {
                transform_statements(clause.block.children)
            })
            break
    }
*/

function is_streamlined_function_call(n) {
    return (
        n.type === CALL &&
        n.children[0].type === IDENTIFIER &&
        ends_with_underscore(n.children[0].value)
    )
}

function contains_streamlined_function_call(children) {
    for (var i in children) {
        var n = children[i]
        if (is_streamlined_function_call(n)) {
            return true
        }
        if (contains_streamlined_function_call(n.children)) {
            return true
        }
    }
    return false
}

function find_streamlined_function_call(children) {
    for (var i in children) {
        var n = children[i]
        if (is_streamlined_function_call(n)) {
            return {
                n: n,
                children: children,
                i: i,
            }
        }
        var result = find_streamlined_function_call(n.children)
        if (result) return result
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

function transform_call(n) {
    console.log('transforming call to ' + n.children[0].value)
    var ident = get_ident()

    n.children[0].value = strip_underscore(n.children[0].value)
    n.children[1].push({
        type: FUNCTION,
        params: ['err', ident]
    })
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

        if (n.forEach)       n.forEach(scan)
        if (n.children)      n.children.forEach(scan)
        if (n.funDecls)      n.funDecls.forEach(scan)
        if (n.catchClauses)  n.catchClauses.forEach(scan)
        if (n.initializer)   scan(n.initializer)
        if (n.body)          scan(n.body)
        if (n.expression)    scan(n.expression)
        if (n.condition)     scan(n.condition)
        if (n.thenPart)      scan(n.thenPart)
        if (n.elsePart)      scan(n.elsePart)
        if (n.value)         scan(n.value)
        if (n.block)         scan(n.block)
        if (n.tryBlock)      scan(n.tryBlock)
        if (n.exception)     scan(n.exception)
    }
    scan(tree)
}
