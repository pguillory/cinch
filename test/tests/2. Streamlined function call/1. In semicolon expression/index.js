exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 6);
        next();
    });
};
function f(__callback_2) {
    var result;
    return g(function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        result = (__result_3 + 1);
        return __callback_2(null, result);
    });
};
function g(__callback_4) {
    return __callback_4(null, 5);
};
