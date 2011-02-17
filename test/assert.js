var assert = exports

assert.is_true = function(value) {
    if (value !== true) {
        throw new Error('is_true(' + value + ')');
    }
}

assert.is_false = function(value) {
    if (value !== false) {
        throw new Error('is_false(' + value + ')');
    }
}

assert.is_null = function(value) {
    if (value !== null) {
        throw new Error('is_null(' + value + ')');
    }
}

assert.is_undefined = function(value) {
    if (value !== undefined) {
        throw new Error('is_undefined(' + value + ')');
    }
}

assert.is = function(value, prototype) {
    if (typeof value !== 'object' || value.constructor !== prototype) {
        throw new Error('is(' + value + ', ' + prototype + ')');
    }
}

assert.is_error = function(value) {
    if (typeof value !== 'object' || value.constructor !== Error) {
        throw new Error('is_error(' + value.constructor + ')');
    }
}


assert.equal = function(a, b) {
    if (a !== b) {
        throw new Error('equal(' + a + ', ' + b + ')');
    }
}
