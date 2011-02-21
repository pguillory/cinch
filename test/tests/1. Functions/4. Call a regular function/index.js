exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_true(g_called);
        next();
    });
};
function f(__callback_2) {
    g();
    return __callback_2(null);
};
var g_called = false;
function g() {
    g_called = true;
};
