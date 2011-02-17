var util = require('util')
var fs = require('fs')
var narc = require('./narcissus')
var tokens = narc.definitions.tokens
var pp = narc.decompiler.pp

/*console.log(narc.definitions.consts)*/
eval(narc.definitions.consts);

var snippets = {
    assign: function(a, b) {
        return {
            type: SEMICOLON,
            expression: {
                type: ASSIGN,
                children: [
                    a,
                    b
                ]
            }
        }
    },
    callback_null: function(n) {
        if (n) {
            return {
                type: CALL,
                children: [
                    {
                        type: IDENTIFIER,
                        value: 'callback',
                    },
                    {
                        type: LIST,
                        children: [
                            {
                                type: NULL,
                                value: 'null',
                            },
                            n
                        ]
                    }
                ]
            }
        } else {
            return {
                type: CALL,
                children: [
                    {
                        type: IDENTIFIER,
                        value: 'callback',
                    },
                    {
                        type: LIST,
                        children: [
                            {
                                type: NULL,
                                value: 'null',
                            }
                        ]
                    }
                ]
            }
        }
    },
    err: function() {
        return {
            type: IDENTIFIER,
            value: 'err'
        }
    },
    callback: function() {
        return {
            type: IDENTIFIER,
            value: 'callback'
        }
    },
    'null': function() {
        return {
            type: NULL
        }
    },
    throw_err: function() {
        return {
            type: THROW,
            exception: snippets.err()
        }
    },
    return_callback: function(err_ident) {
        return {
            type: IF,
            condition: snippets.callback(),
            thenPart: {
                type: RETURN,
                value: {
                    type: CALL,
                    children: [
                        snippets.callback(),
                        {
                            type: LIST,
                            children: [
                                err_ident
                            ]
                        }
                    ]
                }
            },
            elsePart: snippets.throw_err(),
        }
    },
    return_callback_err: function() {
        return {
            type: IF,
            condition: snippets.callback(),
            thenPart: {
                type: RETURN,
                value: {
                    type: CALL,
                    children: [
                        snippets.callback(),
                        {
                            type: LIST,
                            children: [
                                snippets.err()
                            ]
                        }
                    ]
                }
            },
            elsePart: snippets.throw_err(),
        }
    },
    return_callback_null: function() {
        return {
            type: IF,
            condition: snippets.callback(),
            thenPart: {
                type: RETURN,
                value: {
                    type: CALL,
                    children: [
                        snippets.callback(),
                        {
                            type: LIST,
                            children: [
                                snippets.null()
                            ]
                        }
                    ]
                }
            },
        }
    },
    return_callback_value: function(n) {
        return {
            type: IF,
            condition: snippets.callback(),
            thenPart: {
                type: RETURN,
                value: {
                    type: CALL,
                    children: [
                        snippets.callback(),
                        {
                            type: LIST,
                            children: [
                                snippets.null(),
                                n
                            ]
                        }
                    ]
                }
            },
        }
    },
    if_err_return_callback_err: function() {
        return {
            type: IF,
            condition: {
                type: IDENTIFIER,
                value: 'err',
            },
            thenPart: snippets.return_callback_err()
        }
    },
    function_err_result: function(ident, children) {
        return {
            type: FUNCTION,
            params: ['err', ident],
            body: {
                type: SCRIPT,
                children: [
                    snippets.if_err_return_callback_err()
                ].concat(children)
            }
        }
    },
    try_catch_return_callback_err: function(n) {
        return {
            type: TRY,
            value: 'try',
            tryBlock: {
                type: BLOCK,
                children: [
                    n
                ]
            },
            catchClauses: [
                {
                    type: CATCH,
                    varName: 'err',
                    block: {
                        type: BLOCK,
                        children: [
                            snippets.return_callback_err()
                        ]
                    }
                }
            ]
        }
    }
}

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

    var n = narc.parser.parse(source)
    strip(n)
    fs.writeFileSync(filename + '-before.json', JSON.stringify(n), 'utf8')

    var n = narc.parser.parse(source)
    //transform_statements(n.children)
    n.funDecls.forEach(transform_function)
    var transformed = pp(n) + '\n'
    strip(n)
    fs.writeFileSync(filename + '-after.json', JSON.stringify(n), 'utf8')
    return transformed
}

exports.transform = function(source) {
    var n = narc.parser.parse(source)
    //transform_statements(n.children)
    n.funDecls.forEach(transform_function)
    var transformed = pp(n) + '\n'
    return transformed
}

function dump(n) {
    strip(n)
    fs.writeFileSync('dump.json', JSON.stringify(n), 'utf8')
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
        //console.log('no transformation found')
        return [statement].concat(transform_statements(statements))
    }
}

var transformations = {
    throw: function(statement, statements) {
        return [
            snippets.return_callback(statement.exception)
        ]
    },
    return: function(statement, statements) {
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
    return n.type === CALL
        && n.children[0].type === IDENTIFIER
        && ends_with_underscore(n.children[0].value)
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
    return n.type === CALL
        && n.children[0].type === IDENTIFIER
        && !ends_with_underscore(n.children[0].value)
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
    if (!tree) return

    delete tree.tokenizer
    delete tree.lineno
    delete tree.start
    delete tree.end
    if (typeof tree.type === 'number') tree.type = tokens[tree.type] + '(' + tree.type + ')'

    if (tree.forEach)       tree.forEach(strip)
    if (tree.children)      tree.children.forEach(strip)
    if (tree.funDecls)      tree.funDecls.forEach(strip)
    if (tree.catchClauses)  tree.catchClauses.forEach(strip)
    if (tree.initializer)   strip(tree.initializer)
    if (tree.body)          strip(tree.body)
    if (tree.expression)    strip(tree.expression)
    if (tree.condition)     strip(tree.condition)
    if (tree.thenPart)      strip(tree.thenPart)
    if (tree.elsePart)      strip(tree.elsePart)
    if (tree.value)         strip(tree.value)
    if (tree.block)         strip(tree.block)
    if (tree.tryBlock)      strip(tree.tryBlock)
    if (tree.exception)     strip(tree.exception)
}
