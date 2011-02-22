exports.test = function(next, assert) {
    divide_integers(22, 3, function(err, result) {
        assert.equal(result, 7);
        next();
    });
};
function divide_integers(dividend, divisor, __callback_2) {
    var i = 0;
    var quotient = 0;
    __while_loop_3();
    function __while_loop_3() {
        if ((i < dividend)) {
            __then_block_5();
        }
         else {
            __break_4();
        }
    ;
        function __then_block_5() {
            i++;
            if (((i % divisor) > 0)) {
                __then_block_7();
            }
             else {
                __rest_block_8();
            }
        ;
            function __then_block_7() {
                return __while_loop_3();
            };
            function __rest_block_8() {
                quotient++;
                setTimeout(__while_loop_3, 0);
            };
        };
    ;
    };
    function __break_4() {
        return __callback_2(null, quotient);
    };
};
