function f(a, b, callback) {
    function square(x, callback) {
        return callback(null, (x * x));
    };
    return callback(null, (square(a) + b));
};
