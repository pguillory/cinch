var Narcissus = require('./narcissus')
eval(Narcissus.definitions.consts);

var snippets = exports

snippets.assign = function(a, b) {
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
}

snippets.err = function() {
    return {
        type: IDENTIFIER,
        value: 'err'
    }
}

snippets.result = function() {
    return {
        type: IDENTIFIER,
        value: 'result'
    }
}


snippets.callback = function() {
    return {
        type: IDENTIFIER,
        value: 'callback'
    }
}

snippets.null = function() {
    return {
        type: NULL
    }
}

snippets.throw = function(err_ident) {
    return {
        type: THROW,
        exception: err_ident
    }
}

snippets.throw_err = function() {
    return snippets.throw(snippets.err())
}

snippets.return_callback = function(err_ident) {
    return {
        type: BLOCK,
        children: [
            {
                type: VAR,
                children: [
                    {
                        type: IDENTIFIER,
                        value: 'err',
                        name: 'err',
                        initializer: err_ident,
                    }
                ]
            },
            snippets.return_callback_err()
        ]
    }
}

snippets.return_callback_err = function() {
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
}

snippets.return_callback_null = function() {
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
        elsePart: {
            type: RETURN,
        },
    }
}

snippets.return_callback_value = function(n) {
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
        elsePart: {
            type: RETURN,
        }
    }
}

snippets.if_err_return_callback_err = function() {
    return {
        type: IF,
        condition: {
            type: IDENTIFIER,
            value: 'err',
        },
        thenPart: snippets.return_callback_err()
    }
}

snippets.function_err_result = function(result_ident, children) {
    return {
        type: FUNCTION,
        params: ['err', result_ident],
        body: {
            type: SCRIPT,
            children: [
                snippets.if_err_return_callback_err()
            ].concat(children)
        }
    }
}

snippets.function_err = function(children) {
    return {
        type: FUNCTION,
        params: ['err'],
        body: {
            type: SCRIPT,
            children: [
                snippets.if_err_return_callback_err()
            ].concat(children)
        }
    }
}

snippets.try_catch_return_callback_err = function(n) {
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

snippets.call = function(ident, params) {
    return {
        type: CALL,
        children: [
            ident,
            {
                type: LIST,
                children: params
            }
        ]
    }
}

snippets.function = function(ident, params, children) {
    return {
        type: FUNCTION,
        name: ident.value,
        params: params,
        body: {
            type: SCRIPT,
            children: children
        }
    }
}

snippets.anonymous_function = function(params, children) {
    return {
        type: FUNCTION,
        params: params,
        body: {
            type: SCRIPT,
            children: children
        }
    }
}

snippets.if = function(condition, thenChildren, elseChildren) {
    return {
        type: IF,
        condition: condition,
        thenPart: {
            type: BLOCK,
            children: thenChildren,
        },
        elsePart: elseChildren ? {
            type: BLOCK,
            children: elseChildren,
        } : null,
    }
}

snippets.nextTick = function(ident) {
    return snippets.call({
        type: IDENTIFIER,
        value: 'setTimeout',
    }, [
        ident,
        {
            type: NUMBER,
            value: 0
        }
    ])
}

snippets.try_prefix = function(catch_block_ident) {
    var main_callback_ident = {
        type: IDENTIFIER,
        value: 'main_callback'
    }
    return [
        {
            type: VAR,
            children: [
                {
                    type: IDENTIFIER,
                    value: 'main_callback',
                    name: 'main_callback',
                    initializer: {
                        type: IDENTIFIER,
                        value: 'callback'
                    }
                }
            ]
        },
        {
            type: VAR,
            children: [
                {
                    type: IDENTIFIER,
                    value: 'callback',
                    name: 'callback',
                    initializer: snippets.anonymous_function(['err', 'result'], [
                        {
                            type: SEMICOLON,
                            expression: {
                                type: CALL,
                                children: [
                                    {
                                        type: HOOK,
                                        children: [
                                            snippets.err(),
                                            catch_block_ident,
                                            main_callback_ident,
                                        ],
                                        parenthesized: true
                                    },
                                    {
                                        type: LIST,
                                        children: [
                                            snippets.err(),
                                            snippets.result(),
                                        ]
                                    }
                                ]
                            }
                        }
/*
                        {
                            type: IF,
                            condition: snippets.err(),
                            thenPart: {
                                type: BLOCK,
                                children: [
                                    snippets.call(catch_block_ident, [snippets.err()])
                                ]
                            },
                            elsePart: {
                                type: BLOCK,
                                children: [
                                    snippets.call(main_callback_ident, [snippets.null(), snippets.result()])
                                ]
                            }
                        }
*/
                    ])
                }
            ]
        },
    ]
}

/*
var main_callback = callback
var callback = function(err, result) {
    if (err) return __catch_block_2(err)
    return main_callback(null, result)
}
*/
