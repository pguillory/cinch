var util = require('util')
var fs = require('fs')
var narc = require('../lib/narcissus')
var tokens = narc.definitions.tokens
var pp = narc.decompiler.pp

eval(narc.definitions.consts);
var IF_ERR_RETURN_CALLBACK_ERR = {
    type: IF,
    condition: {
        type: IDENTIFIER,
        value: 'err',
    },
    thenPart: {
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
}

var source = fs.readFileSync('foo_.js', 'utf8')
var n = narc.parser.parse(source)

/*fs.writeFileSync('n_before.json', JSON.stringify(n), 'utf8')*/
n.funDecls.forEach(scan_function)
var transformed = pp(n) + '\n'
fs.writeFileSync('foo.js', transformed, 'utf8')
dump(n)

function dump(n) {
    strip(n)
    fs.writeFileSync('dump.json', JSON.stringify(n), 'utf8')
    process.exit()
}

function scan_function(func) {
    // console.log('function ' + func.name)
    var funDecls = func.body.funDecls

    if (ends_with_underscore(func.name)) {
        transform_function(func)
    }

    funDecls.forEach(scan_function)
}

function ends_with_underscore(s) {
    return (s[s.length - 1] === '_')
}

function strip_underscore(s) {
    if (!ends_with_underscore(s)) throw new Error('thought that had an underscore')
    return s.slice(0, s.length - 1)
}

function transform_function(func) {
    console.log('transforming function ' + func.name)
    func.name = strip_underscore(func.name)
    func.params.push('callback')
    transform_children(func.body.children)
}

function transform_children(children) {
    for (var i in children) {
        var n = children[i]
        console.log('child ' + tokens[n.type])
        switch (n.type) {
            case RETURN:
                if (is_streamlined_function_call(n.value)) {
                    n.value.children[0].value = strip_underscore(n.value.children[0].value)
                    n.value.children[1].children.push({
                        type: IDENTIFIER,
                        value: 'callback',
                    })
                } else if (contains_streamlined_function_call(n.value.children)) {
                    console.log('return contains_streamlined_function_call')
                    var children_left = children.splice(parseInt(i) + 1)
                    var found = find_streamlined_function_call(n.value.children)
                    found.children[found.i] = {
                        type: IDENTIFIER,
                        value: 'result',
                    }
                    found.n.children[0].value = strip_underscore(found.n.children[0].value)
                    found.n.children[1].children.push({
                        type: FUNCTION,
                        params: ['err', 'result'],
                        body: {
                            type: SCRIPT,
                            value: '{',
                            children: [
                                IF_ERR_RETURN_CALLBACK_ERR,
                                {
                                    type: RETURN,
                                    value: n.value
                                }
                            ]
                        }
                    })

                    n.value = found.n
                } else {
                    transform_return(n)
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
            default:
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

function transform_return(n) {
    console.log('transforming return')

    n.value = {
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
                    n.value
                ]
            }
        ]
    }
}

function transform_call(n) {
    console.log('transforming call to ' + n.children[0].value)
    n.children[0].value = strip_underscore(n.children[0].value)
    n.children[1].push({
        type: FUNCTION,
        params: ['err', 'result']
    })
}

function strip(tree) {
    delete tree.tokenizer
    delete tree.lineno
    delete tree.start
    delete tree.end
    if (typeof tree.type === 'number') tree.type = tokens[tree.type] + '(' + tree.type + ')'

    if (tree.children)    tree.children.forEach(strip)
    if (tree.funDecls)    tree.funDecls.forEach(strip)
    if (tree.initializer) strip(tree.initializer)
    if (tree.body)        strip(tree.body)
    if (tree.expression)  strip(tree.expression)
    if (tree.condition)   strip(tree.condition)
    if (tree.thenPart)    strip(tree.thenPart)
    if (tree.value)       strip(tree.value)
}
