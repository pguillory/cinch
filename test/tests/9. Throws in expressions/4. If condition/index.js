var test_error = new Error();
exports.test = function(next, assert) {
    f(true, function(err, result) {
        assert.equal(err, test_error);
        f(false, function(err, result) {
            assert.is_null(err);
            assert.equal(result, 5);
            next();
        });
    });
};
function f(crash, __callback_2) {
    try {
        var __result_3 = g(crash);
    } catch (err) {
        return __callback_2(err);
    };
    if (__result_3) {
        return __callback_2(null, 5);
    }
     else {
        return __callback_2(null);
    }
;
};
function g(crash) {
    if (crash) {
        throw test_error;
    }
;
    return true;
};