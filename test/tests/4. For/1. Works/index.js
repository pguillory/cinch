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
    x(function(err) {
        if (err) {
            return __callback_2(err)
        };
        __for_loop_3();
        function __for_loop_3() {
            return y(function(err, __result_5) {
                if (err) {
                    return __callback_2(err)
                };
                if (__result_5) {
                    __then_block_6();
                }
                 else {
                    __rest_4();
                }
            ;
                function __then_block_6() {
                    w(function(err) {
                        if (err) {
                            return __callback_2(err)
                        };
                        z(function(err) {
                            if (err) {
                                return __callback_2(err)
                            };
                            setTimeout(__for_loop_3, 0);
                        });
                    });
                };
            ;
            });
        };
        function __rest_4() {
            return __callback_2(null, 5);
        };
    });
};
var w_called = false;
function w(__callback_8) {
    w_called = true;
    return __callback_8(null);
};
var x_called = false;
function x(__callback_9) {
    x_called = true;
    return __callback_9(null);
};
var y_called = false;
function y(__callback_10) {
    if (y_called) {
        __then_block_11();
    }
     else {
        __else_block_12();
    }
;
    function __then_block_11() {
        return __callback_10(null, false);
    };
    function __else_block_12() {
        y_called = true;
        return __callback_10(null, true);
    };
    function __rest_block_13() {
        return __callback_10(null);
    };
};
var z_called = false;
function z(__callback_14) {
    z_called = true;
    return __callback_14(null);
};
