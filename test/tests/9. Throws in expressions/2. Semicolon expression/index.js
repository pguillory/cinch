var test_error = new Error();
exports.test = function(next, assert) {
    f(true, function(err, result) {
        assert.equal(err, test_error);
        f(false, function(err, result) {
            assert.is_null(err);
            assert.equal(result, 2);
            next();
        });
    });
};
function f(crash, __callback_2) {
    var retval;
    try {
        retval = (g(crash) + 1);
    } catch (err) {
        return __callback_2(err);
    };
    return __callback_2(null, retval);
};
function g(crash) {
    if (crash) {
        throw test_error;
    }
     else {
        return 1;
    }
;
};
