exports.test = function(next, assert) {
    sum([3,4,5,], function(err, result) {
        assert.is_null(err);
        assert.equal(result, 12);
        next();
    });
};
function sum(values, __callback_2) {
    var total = 0;
    var __props_3 = [];
    for (var i in values) {
        __props_3.push(i);
    };
    var __i_4 = 0;
    __for_loop_5();
    function __for_loop_5() {
        if ((__i_4 < __props_3.length)) {
            __then_block_7();
        }
         else {
            __rest_6();
        }
    ;
        function __then_block_7() {
            i = __props_3[__i_4];
            return plus(total, values[i], function(err, __result_9) {
                if (err) {
                    return __callback_2(err)
                };
                total = __result_9;
                ++__i_4;
                setTimeout(__for_loop_5, 0);
            });
        };
    ;
    };
    function __rest_6() {
        return __callback_2(null, total);
    };
};
function plus(a, b, callback) {
    return callback(null, (a + b));
};
