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
            i = __props_3[__i_4];
            return plus(total, values[i], function(err, __result_10) {
                if (err) {
                    return __callback_2(err)
                };
                total = __result_10;
                __continue_6();
            });
        }
         else {
            return __callback_2(null, total);
        }
    ;
    };
    function __continue_6() {
        ++__i_4;
        setTimeout(__for_loop_5, 0);
    };
};
function plus(a, b, callback) {
    return callback(null, (a + b));
};
