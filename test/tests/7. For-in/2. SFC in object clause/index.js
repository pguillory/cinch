var util = require("util");
exports.test = function(next, assert) {
    factorial(4, function(err, result) {
        assert.is_null(err);
        assert.equal(result, 24);
        next();
    });
};
function factorial(n, __callback_2) {
    var m = 1;
    var values;
    return range(1, n, function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        var __props_4 = [];
        for (var i in (values = __result_3)) {
            __props_4.push(i);
        };
        var __i_5 = 0;
        __for_loop_6();
        function __for_loop_6() {
            if ((__i_5 < __props_4.length)) {
                __then_block_8();
            }
             else {
                __rest_7();
            }
        ;
            function __then_block_8() {
                i = __props_4[__i_5];
                m *= values[i];
                ++__i_5;
                setTimeout(__for_loop_6, 0);
            };
        ;
        };
        function __rest_7() {
            return __callback_2(null, m);
        };
    });
};
function range(min, max, callback) {
    var numbers = [];
    for (var i = min; (i <= max); i++) {
        numbers.push(i);
    };
    return callback(null, numbers);
};
