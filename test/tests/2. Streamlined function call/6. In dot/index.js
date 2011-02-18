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
function fileLength(path, callback) {
    callback = (callback || __throw_1);
    fs.stat(path, function(err, __result_2) {
        if (err) {
            return callback(err)
        };
        if (__result_2.isFile()) {
            fs.readFile(path, function(err, __result_3) {
                if (err) {
                    return callback(err)
                };
                return callback(null, __result_3.length);
            });
        }
         else {
            return callback(new Error((path + " is not a file")));
        }
    ;
    });
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
