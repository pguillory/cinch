exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    function g(__callback_8) {
        return __callback_8(null, exponent--);
    };
    var n = 1;
    __while_loop_3();
    function __while_loop_3() {
        return g(function(err, __result_5) {
            if (err) {
                return __callback_2(err)
            };
            if ((__result_5 > 0)) {
                n *= base;
                setTimeout(__while_loop_3, 0);
            }
             else {
                return __callback_2(null, n);
            }
        ;
        });
    };
};
