exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    function count(__callback_11) {
        __callback_11 = (__callback_11 || __throw_1);
        return __callback_11(null, exponent--);
    };
    function times(a, b, __callback_12) {
        __callback_12 = (__callback_12 || __throw_1);
        return __callback_12(null, (a * b));
    };
    var n = 1;
    __while_loop_3();
    function __while_loop_3() {
        if (true) {
            __then_block_5();
        }
         else {
            __rest_4();
        }
    ;
        function __then_block_5() {
            return count(function(err, __result_7) {
                if (err) {
                    return __callback_2(err)
                };
                if ((__result_7 == 0)) {
                    __then_block_8();
                }
                 else {
                    __rest_block_9();
                }
            ;
                function __then_block_8() {
                    return __rest_4();
                };
                function __rest_block_9() {
                    return times(n, base, function(err, __result_10) {
                        if (err) {
                            return __callback_2(err)
                        };
                        n = __result_10;
                        setTimeout(__while_loop_3, 0);
                    });
                };
            });
        };
    ;
    };
    function __rest_4() {
        return __callback_2(null, n);
    };
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
