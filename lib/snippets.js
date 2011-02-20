var Narcissus = require('./narcissus')
eval(Narcissus.definitions.consts);

var idents = require('./idents')

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

snippets.null = function() {
    return {
        type: NULL
    }
}

snippets.throw_value = function(err_ident) {
    return {
        type: THROW,
        exception: err_ident
    }
}

snippets.throw_err = function() {
    return snippets.throw_value(snippets.err())
}

snippets.return_callback = function(err_ident) {
    return {
        type: RETURN,
        value: {
            type: CALL,
            children: [
                idents.callback,
                {
                    type: LIST,
                    children: [
                        err_ident
                    ]
                }
            ]
        }
    }
}

snippets.return_callback_err = function() {
    return snippets.return_callback(snippets.err())
}

snippets.undefined = function() {
    return {
        type: IDENTIFIER,
        value: 'undefined'
    }
}

snippets.return_callback_null = function() {
    return snippets.return_callback(snippets.null())
}

snippets.return_callback_value = function(n) {
    return {
        type: RETURN,
        value: {
            type: CALL,
            children: [
                idents.callback,
                {
                    type: LIST,
                    children: [
                        snippets.null(),
                        n
                    ]
                }
            ]
        }
    }
}

snippets.var = function(ident, initializer) {
    return {
        type: VAR,
        children: [
            {
                type: IDENTIFIER,
                value: ident.value,
                name: ident.value,
                initializer: initializer,
            }
        ]
    }
}

snippets.array = function(children) {
    return {
        type: ARRAY_INIT,
        children: children,
    }
}

snippets.if_err_return_callback_err = function() {
    return {
        type: IF,
        condition: snippets.err(),
        thenPart: snippets.return_callback_err()
    }
}

snippets.function_err_result = function(result_ident, children) {
    return {
        type: FUNCTION,
        params: ['err', result_ident.value],
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
    var main_callback_ident = idents.get('main_callback')
    return [
        {
            type: VAR,
            children: [
                {
                    type: IDENTIFIER,
                    value: main_callback_ident.value,
                    name: main_callback_ident.value,
                    initializer: {
                        type: IDENTIFIER,
                        value: idents.callback.value
                    }
                }
            ]
        },
        {
            type: VAR,
            children: [
                {
                    type: IDENTIFIER,
                    value: idents.callback.value,
                    name: idents.callback.value,
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
                    ])
                }
            ]
        },
    ]
}

snippets.helpers = function() {
    return snippets.function(idents.throw, ['err'], [
        snippets.if(snippets.err(), [
            snippets.throw_err()
        ])
    ])
}

snippets.callback_or_throw = function() {
    return snippets.assign(
        idents.callback,
        {
            type: OR,
            children: [
                idents.callback,
                idents.throw
            ]
        }
    )
}

snippets.number = function(value) {
    return {
        type: NUMBER,
        value: value
    }
}

snippets.less_than = function(a, b) {
    return {
        type: LT,
        children: [
            a, b
        ]
    }
}

snippets.ident = function(value) {
    return {
        type: IDENTIFIER,
        value: value
    }
}

snippets.string = function(value) {
    return {
        type: STRING,
        value: value
    }
}
