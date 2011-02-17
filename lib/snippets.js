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

snippets.callback_null = function(n) {
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
}

snippets.err = function() {
    return {
        type: IDENTIFIER,
        value: 'err'
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

snippets.throw_err = function() {
    return {
        type: THROW,
        exception: snippets.err()
    }
}

snippets.return_callback = function(err_ident) {
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

snippets.function_err_result = function(ident, children) {
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
