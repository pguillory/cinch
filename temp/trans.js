var util = require('util')
var fs = require('fs')
var narc = require('../lib/narcissus')
var tokens = narc.definitions.tokens
var pp = narc.decompiler.pp

/*console.log(narc.definitions.consts)*/
eval(narc.definitions.consts);

var snippets = {
    callback_null: function(n) {
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
    },
    return_callback_err: function() {
        return {
            type: RETURN,
            value: {
                type: CALL,
                children: [
                    {
                        type: IDENTIFIER,
                        value: 'callback'
                    },
                    {
                        type: LIST,
                        children: [
                            {
                                type: IDENTIFIER,
                                value: 'err'
                            }
                        ]
                    }
                ]
            }
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
    function_err_result: function(n, ident) {
        return {
            type: FUNCTION,
            params: ['err', ident],
            body: {
                type: SCRIPT,
                children: [
                    {
                        type: RETURN,
                        value: n
                    }
                ]
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

var source = fs.readFileSync('foo_.js', 'utf8')
var n = narc.parser.parse(source)

/*fs.writeFileSync('n_before.json', JSON.stringify(n), 'utf8')*/
n.funDecls.forEach(transform_function)
var transformed = pp(n) + '\n'
fs.writeFileSync('foo.js', transformed, 'utf8')
dump(n)

function dump(n) {
    strip(n)
    fs.writeFileSync('dump.json', JSON.stringify(n), 'utf8')
    process.exit()
}

function transform_function(func) {
    // console.log('function ' + func.name)
    var funDecls = func.body.funDecls

    if (ends_with_underscore(func.name)) {
        console.log('transforming function ' + func.name)
        func.name = strip_underscore(func.name)
        func.params.push('callback')
        transform_children(func.body.children)
    }

    funDecls.forEach(transform_function)
}

function transform_children(children) {
    for (var i in children) {
        var n = children[i]
        console.log('child ' + tokens[n.type])
        switch (n.type) {
            case IDENTIFIER:
                break
            case SEMICOLON:
                break
            case RETURN:
                if (is_streamlined_function_call(n.value)) {
                    n.value.children[0].value = strip_underscore(n.value.children[0].value)
                    transform_children(n.value.children[1].children)
                    n.value.children[1].children.push({
                        type: IDENTIFIER,
                        value: 'callback',
                    })
                } else if (contains_streamlined_function_call(n.value.children)) {
                    console.log('return contains_streamlined_function_call')
                    var children_left = children.splice(parseInt(i) + 1)
                    var found = find_streamlined_function_call(n.value.children)
                    var ident = {
                        type: IDENTIFIER,
                        value: 'result55',
                    }
                    found.children[found.i] = ident
                    var callback = snippets.function_err_result(n.value, ident)
                    transform_children(callback.body.children)
                    callback.body.children.unshift(snippets.if_err_return_callback_err())
                    found.n.children[0].value = strip_underscore(found.n.children[0].value)
                    transform_children(found.n.children[1].children)
                    found.n.children[1].children.push(callback)

                    n.value = found.n
                } else if (contains_regular_function_call(n.value.children)) {
                    console.log('return contains_regular_function_call')
                    var ident = {
                        type: IDENTIFIER,
                        value: 'result1',
                    }
                    
                    var found = find_regular_function_call(n.value.children)
                    children.splice(parseInt(i), 0, snippets.try_catch_return_callback_err({
                        type: SEMICOLON,
                        expression: {
                            type: ASSIGN,
                            children: [
                                ident,
                                n.value
                            ]
                        }
                    }))
                    n.value = ident
                } else {
                    n.value = snippets.callback_null(n.value)
                }
                break
            case FUNCTION:
                break
            case CALL:
                if (is_streamlined_function_call(n)) {
                    transform_call(n)
                }
                console.log('call to ' + n.children[0].value)
                break
            case TRY:
                transform_children(n.tryBlock.children)
                n.catchClauses.forEach(function(clause) {
                    transform_children(clause.block.children)
                })
                break
            default:
                console.log('unknown type: ' + tokens[n.type])
                util.debug(pp(n))
                transform_children(n.children)
                break
        }
    }
}

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
    n.children[0].value = strip_underscore(n.children[0].value)
    transform_children(n.children[1])
    n.children[1].push({
        type: FUNCTION,
        params: ['err', 'result']
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
    delete tree.tokenizer
    delete tree.lineno
    delete tree.start
    delete tree.end
    if (typeof tree.type === 'number') tree.type = tokens[tree.type] + '(' + tree.type + ')'

    if (tree.children)     tree.children.forEach(strip)
    if (tree.funDecls)     tree.funDecls.forEach(strip)
    if (tree.catchClauses) tree.catchClauses.forEach(strip)
    if (tree.initializer)  strip(tree.initializer)
    if (tree.body)         strip(tree.body)
    if (tree.expression)   strip(tree.expression)
    if (tree.condition)    strip(tree.condition)
    if (tree.thenPart)     strip(tree.thenPart)
    if (tree.value)        strip(tree.value)
    if (tree.block)        strip(tree.block)
    if (tree.tryBlock)     strip(tree.tryBlock)
}
