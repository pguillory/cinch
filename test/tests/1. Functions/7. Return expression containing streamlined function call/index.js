/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    sum_squares(3, 4, function(err, result) {
        assert.equal(result, (5 * 5));
        next();
    });
};
function sum_squares(a, b, callback) {
    square(a, function(err, result3) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        square(b, function(err, result4) {
            if (err) {
                if (callback) {
                    return callback(err)
                } else {
                    throw err
                }
            };
            if (callback) {
                return callback(null, (result3 + result4))
            };
        });
    });
};
function square(x, callback) {
    if (callback) {
        return callback(null, (x * x))
    };
};
