/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    function count(__callback_6) {
        __callback_6 = (__callback_6 || __throw_1);
        return __callback_6(null, exponent--);
    };
    function times(a, b, __callback_7) {
        __callback_7 = (__callback_7 || __throw_1);
        return __callback_7(null, (a * b));
    };
    var n = 1;
    __while_loop_3();
    function __while_loop_3() {
        return count(function(err, __result_4) {
            if (err) {
                return __callback_2(err)
            };
            if ((__result_4 > 0)) {
                return times(n, base, function(err, __result_5) {
                    if (err) {
                        return __callback_2(err)
                    };
                    n = __result_5;
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
function __throw_1(err) {if (err) {throw err}};
