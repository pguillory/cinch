var Narcissus = require('./narcissus')
eval(Narcissus.definitions.consts);

var ident_counter
var callback_idents

function reset() {
    ident_counter = 0
    callback_idents = []
    exports.throw = get('throw')
}

function get(name) {
    ident_counter += 1
    return {
        type: IDENTIFIER,
        value: '__' + (name || 'ident') + '_' + ident_counter,
    }
}


function push_callback() {
    callback_idents.unshift(exports.callback)
    exports.callback = get('callback')
}

function pop_callback() {
    exports.callback = callback_idents.shift()
}

exports.reset = reset
exports.get = get
exports.push_callback = push_callback
exports.pop_callback = pop_callback
