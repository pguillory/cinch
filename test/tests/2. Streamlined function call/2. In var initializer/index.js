/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 6);
        next();
    });
};
function f(callback) {
    g(function(err, result1) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        var result = (result1 + 1);
        if (callback) {
            return callback(null, result)
        } else {
            return
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
