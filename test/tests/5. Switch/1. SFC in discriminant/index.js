exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 6);
        next();
    });
};
function f(__callback_2) {
    return g(function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        switch (__result_3) {
          case 5:
            return __case_4();
          default:
            return __case_5();
        };
        __break_6();
        function __case_4() {
            return __callback_2(null, 6);
        };
        function __case_5() {
            return __callback_2(null, 7);
        };
        function __break_6() {
            return __callback_2(null);
        };
    });
};
function g(callback) {
    return callback(null, 5);
};
