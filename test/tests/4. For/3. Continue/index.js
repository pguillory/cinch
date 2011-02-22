exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_null(err);
        assert.equal(result, 5);
        next();
    });
};
function f(__callback_2) {
    var i = 0;
    __for_loop_3();
    function __for_loop_3() {
        if ((i < 10)) {
            __then_block_6();
        }
         else {
            __break_5();
        }
    ;
        function __then_block_6() {
            if ((i !== 5)) {
                __then_block_8();
            }
             else {
                __rest_block_9();
            }
        ;
            function __then_block_8() {
                return __continue_4();
            };
            function __rest_block_9() {
                return __callback_2(null, 5);
            };
        };
    ;
    };
    function __continue_4() {
        i++;
        setTimeout(__for_loop_3, 0);
    };
    function __break_5() {
        return __callback_2(null);
    };
};
