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
            i++;
            if (((i % divisor) > 0)) {
                return __while_loop_3();
            }
             else {
                quotient++;
                setTimeout(__while_loop_3, 0);
            }
        ;
        }
         else {
            return __callback_2(null, quotient);
        }
    ;
    };
};
