/*** Generated by Cinch ***/
exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    function count(__callback_11) {
        return __callback_11(null, exponent--);
    };
    function times(a, b, __callback_12) {
        return __callback_12(null, (a * b));
    };
    var n = 1;
    __while_loop_3();
    function __while_loop_3() {
        if (true) {
            return count(function(err, __result_7) {
                if (err) {
                    return __callback_2(err)
                };
                if ((__result_7 == 0)) {
                    return __break_4();
                }
                 else {
                    return times(n, base, function(err, __result_10) {
                        if (err) {
                            return __callback_2(err)
                        };
                        n = __result_10;
                        setTimeout(__while_loop_3, 0);
                    });
                }
            ;
            });
        }
         else {
            __break_4();
        }
    ;
    };
    function __break_4() {
        return __callback_2(null, n);
    };
};
