/*** Generated by streamline.js - DO NOT EDIT ***/
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
    __callback_2 = (__callback_2 || __throw_1);
    return fs.stat(path, function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        if (__result_3.isFile()) {
            return fs.readFile(path, function(err, __result_4) {
                if (err) {
                    return __callback_2(err)
                };
                return __callback_2(null, __result_4.length);
            });
        }
         else {
            return __callback_2(new Error((path + " is not a file")));
        }
    ;
        return __callback_2(null);
    });
};
function __throw_1(err) {if (err) {throw err}};
