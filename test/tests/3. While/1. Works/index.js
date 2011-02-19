exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    function g(__callback_8) {
        __callback_8 = (__callback_8 || __throw_1);
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
                __then_block_6();
            }
             else {
                __else_block_7();
            }
        ;
            function __then_block_6() {
                n *= base;
                setTimeout(__while_loop_3, 0);
            };
            function __else_block_7() {
                __rest_4();
            };
        });
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
