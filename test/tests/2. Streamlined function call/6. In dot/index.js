var path = require("path");
var fs = require("fs");
exports.test = function(next, assert) {
    var filename = path.join(__dirname, "test.txt");
    fileLength(filename, function(err, result) {
        assert.equal(result, 5);
        next();
    });
};
function fileLength(path, __callback_2) {
    return fs.stat(path, function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        if (__result_3.isFile()) {
            __then_block_4();
        }
         else {
            __else_block_5();
        }
    ;
        function __then_block_4() {
            return fs.readFile(path, function(err, __result_7) {
                if (err) {
                    return __callback_2(err)
                };
                return __callback_2(null, __result_7.length);
            });
        };
        function __else_block_5() {
            return __callback_2(new Error((path + " is not a file")));
        };
        function __rest_block_6() {
            return __callback_2(null);
        };
    });
};
