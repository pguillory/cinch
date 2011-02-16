function sum_squares(a, b, callback) {
    function square(x, callback) {
        return callback(null, (x * x));
    };
    foo();
    return square(a, function(err, result55) {
        if (err) {
            return callback(err)
        };
        return square(b, function(err, result55) {
            if (err) {
                return callback(err)
            };
            try {
                result1 = ((result55 + result55) + syncFunc());
            } catch (err) {
                return callback(err);
            };
            return result1;
        });
    });
};
