exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(err, 6);
        next();
    });
};
function f(__callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    return g(function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        return __callback_2((__result_3 + 1));
    });
};
function g(__callback_4) {
    __callback_4 = (__callback_4 || __throw_1);
    return __callback_4(null, 5);
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
