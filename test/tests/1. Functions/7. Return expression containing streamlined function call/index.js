/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    sum_squares(3, 4, function(err, result) {
        assert.equal(result, (5 * 5));
        next();
    });
};
function sum_squares(a, b, callback) {
    square(a, function(err, __async_result_1) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        square(b, function(err, __async_result_2) {
            if (err) {
                if (callback) {
                    return callback(err)
                } else {
                    throw err
                }
            };
            if (callback) {
                return callback(null, (__async_result_1 + __async_result_2))
            } else {
                return
            };
        });
    });
};
function square(x, callback) {
    if (callback) {
        return callback(null, (x * x))
    } else {
        return
    };
};
