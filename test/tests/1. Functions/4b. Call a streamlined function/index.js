/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_true(g_called);
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
        result1;
        if (callback) {
            return callback(null)
        } else {
            return
        };
    });
};
var g_called = false;
function g(callback) {
    g_called = true;
    if (callback) {
        return callback(null)
    } else {
        return
    };
};