exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    function count(__callback_9) {
        return __callback_9(null, exponent--);
    };
    function times(a, b, __callback_10) {
        return __callback_10(null, (a * b));
    };
    var n = 1;
    __while_loop_3();
    function __while_loop_3() {
        return count(function(err, __result_5) {
            if (err) {
                return __callback_2(err)
            };
            if ((__result_5 > 0)) {
                return times(n, base, function(err, __result_8) {
                    if (err) {
                        return __callback_2(err)
                    };
                    n = __result_8;
                    setTimeout(__while_loop_3, 0);
                });
            }
             else {
                return __callback_2(null, n);
            }
        ;
        });
    };
};
