/* streamlined */
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
            try {
                result3 = ((result1 + result2) + syncFunc());
            } catch (err) {
                return callback(err);
            };
            return callback(null, result3);
            foo();
        });
    });
};
