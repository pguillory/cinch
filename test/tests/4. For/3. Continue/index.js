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
            if ((i !== 5)) {
                return __continue_4();
            }
             else {
                return __callback_2(null, 5);
            }
        ;
        }
         else {
            return __callback_2(null);
        }
    ;
    };
    function __continue_4() {
        i++;
        setTimeout(__for_loop_3, 0);
    };
};
