/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 6);
        next();
    });
};
function f(callback) {
    g(function(err, result8) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        if (callback) {
            return callback(null, (result8 + 1))
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