exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_true(g_called);
        next();
    });
};
function f(__callback_2) {
    return g(function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        __result_3;
        return __callback_2(null);
    });
};
var g_called = false;
function g(__callback_4) {
    g_called = true;
    return __callback_4(null);
};