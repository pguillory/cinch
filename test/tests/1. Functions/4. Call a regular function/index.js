/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_true(g_called);
        next();
    });
};
function f(callback) {
    g();
    if (callback) {
        return callback(null)
    } else {
        return
    };
};
var g_called = false;
function g() {
    g_called = true;
};
