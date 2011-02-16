function sum_squares(a, b, callback) {
    function square(x, callback) {
        return callback(null, (x * x));
    };
    return square(a, function(err, result1) {
        if (err) {
            return callback(err)
        };
        return square(b, function(err, result2) {
            if (err) {
                return callback(err)
            };
            return ((result1 + result2) + syncFunc());
            foo();
        });
    });
};
