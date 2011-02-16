function f(a, b, callback) {
    function square(x, callback) {
        return callback(null, (x * x));
    };
    return square(a, function(err, result) {
        if (err) {
            return callback(err)
        };
        return ((1 + result) + 1);
    });
};
