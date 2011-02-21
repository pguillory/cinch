exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_null(err);
        assert.is_true((result === 5));
        next();
    });
};
function f(__callback_2) {
    return __callback_2(null, 5);
};
