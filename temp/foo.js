function square_sum(a, b, callback) {
    function square(x, callback) {
        return callback(null, (x * x));
    };
    return square(a, function(err, result) {
        if (err) {
            return callback(err)
        };
        return square(b, function(err, result) {
            if (err) {
                return callback(err)
            };
            return callback(null, ((result + result) + syncFunc()));
        });
    });
};
