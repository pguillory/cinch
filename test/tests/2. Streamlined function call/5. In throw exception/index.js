/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(err, 6);
        next();
    });
};
function f(callback) {
    g(function(err, __async_result_1) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        {
            var err = (__async_result_1 + 1);
            if (callback) {
                return callback(err)
            } else {
                throw err
            };
        };
    });
};
function g(callback) {
    if (callback) {
        return callback(null, 5)
    } else {
        return
    };
};
