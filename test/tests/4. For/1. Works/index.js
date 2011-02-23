exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_null(err);
        assert.equal(result, 5);
        assert.is_true(w_called);
        assert.is_true(x_called);
        assert.is_true(y_called);
        assert.is_true(z_called);
        next();
    });
};
function f(__callback_2) {
    return x(function(err, __result_11) {
        if (err) {
            return __callback_2(err)
        };
        __result_11;
        __for_loop_3();
        function __for_loop_3() {
            return y(function(err, __result_6) {
                if (err) {
                    return __callback_2(err)
                };
                if (__result_6) {
                    __then_block_7();
                }
                 else {
                    __break_5();
                }
            ;
                function __then_block_7() {
                    return w(function(err, __result_9) {
                        if (err) {
                            return __callback_2(err)
                        };
                        __result_9;
                        __continue_4();
                    });
                };
            ;
            });
        };
        function __continue_4() {
            return z(function(err, __result_10) {
                if (err) {
                    return __callback_2(err)
                };
                __result_10;
                setTimeout(__for_loop_3, 0);
            });
        };
        function __break_5() {
            return __callback_2(null, 5);
        };
    });
};
var w_called = false;
function w(__callback_12) {
    w_called = true;
    return __callback_12(null);
};
var x_called = false;
function x(__callback_13) {
    x_called = true;
    return __callback_13(null);
};
var y_called = false;
function y(__callback_14) {
    if (y_called) {
        __then_block_15();
    }
     else {
        __else_block_16();
    }
;
    function __then_block_15() {
        return __callback_14(null, false);
    };
    function __else_block_16() {
        y_called = true;
        return __callback_14(null, true);
    };
    function __rest_block_17() {
        return __callback_14(null);
    };
};
var z_called = false;
function z(__callback_18) {
    z_called = true;
    return __callback_18(null);
};
