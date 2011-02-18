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
    fs.stat(path, function(err, result11) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        if (result11.isFile()) {
            fs.readFile(path, function(err, result12) {
                if (err) {
                    if (callback) {
                        return callback(err)
                    } else {
                        throw err
                    }
                };
                if (callback) {
                    return callback(null, result12.length)
                } else {
                    return
                };
            });
        }
         else {
            {
                var err = new Error((path + " is not a file"));
                if (callback) {
                    return callback(err)
                } else {
                    throw err
                };
            };
        }
    ;
    });
};