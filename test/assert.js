var assert = exports

assert.true = function(value) {
    if (value !== true) {
        throw new Error('true(' + value + ')');
    }
}

assert.false = function(value) {
    if (value !== false) {
        throw new Error('false(' + value + ')');
    }
}

assert.null = function(value) {
    if (value !== null) {
        throw new Error('null(' + value + ')');
    }
}

assert.undefined = function(value) {
    if (value !== undefined) {
        throw new Error('undefined(' + value + ')');
    }
}

assert.is = function(value, prototype) {
    if (typeof value !== 'object' || value.constructor !== prototype) {
        throw new Error('is(' + value + ', ' + prototype + ')');
    }
}

assert.error = function(value) {
    if (typeof value !== 'object' || value.constructor !== Error) {
        throw new Error('error(' + value.constructor + ')');
    }
}
