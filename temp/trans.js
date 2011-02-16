var util = require('util')
var fs = require('fs')
var narc = require('../lib/narcissus')
var tokens = narc.definitions.tokens
var source = fs.readFileSync('foo_.js', 'utf8')
var n = new narc.parser.parse(source)

/*console.log(narc.definitions.consts)*/
eval(narc.definitions.consts);

/*fs.writeFileSync('n_before.json', JSON.stringify(n), 'utf8')*/
n.funDecls.forEach(scan_function)
var transformed = narc.decompiler.pp(n) + '\n'
fs.writeFileSync('foo.js', transformed, 'utf8')

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
                transform_return(n)
                break
            case FUNCTION:
                break
            case CALL:
                console.log('call to ' + n.children[0].value)
                if (n.children[0].type === IDENTIFIER && ends_with_underscore(n.children[0].value)) {
                    transform_call(n)
                }
                break
            default:
                transform_children(n.children)
                break
        }
    }
}

function transform_return(n) {
    console.log('transforming return')
    transform_children(n.value.children)
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
