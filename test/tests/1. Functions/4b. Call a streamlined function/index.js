exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_true(g_called);
        next();
    });
};
function f(__callback_2) {
    g(__callback_2);
};
var g_called = false;
function g(__callback_3) {
    g_called = true;
    return __callback_3(null);
};
