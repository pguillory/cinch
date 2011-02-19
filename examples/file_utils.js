var path = require("path");
var fs = require("fs");
var util = require("util");
exports.recursive_ls = function(dir, depth, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    return fs.readdir(dir, function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        var dirs = __result_3.sort();
        var __props_4 = [];
        for (var i in dirs) {
            __props_4.push(i);
        };
        var __i_5 = 0;
        __for_loop_6();
        function __for_loop_6() {
            if ((__i_5 < __props_4.length)) {
                __then_block_8();
            }
             else {
                __else_block_9();
            }
        ;
            function __then_block_8() {
                i = __props_4[__i_5];
                ++__i_5;
                setTimeout(__for_loop_6, 0);
            };
            function __else_block_9() {
                __rest_7();
            };
        };
        function __rest_7() {
            return __callback_2(null);
        };
    });
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
