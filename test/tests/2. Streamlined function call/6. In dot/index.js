/*** Generated by streamline.js - DO NOT EDIT ***/
var path = require("path");
var fs = require("fs");
var a = {
    b: {
        fs: fs
    }
};
exports.test = function(next, assert) {
    fileLength(path.join(__dirname, "test.txt"), function(err, result) {
        assert.equal(result, 5);
        next();
    });
};
function fileLength(path, callback) {
    fs.stat(path, function(err, result10) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        if (result10.isFile()) {
            fs.readFile(path, function(err, result11) {
                if (err) {
                    if (callback) {
                        return callback(err)
                    } else {
                        throw err
                    }
                };
                if (callback) {
                    return callback(null, result11.length)
                };
            });
        }
         else {
            if (callback) {
                return callback(new Error((path + " is not a file")))
            } else {
                throw err
            };
        }
    ;
    });
};
