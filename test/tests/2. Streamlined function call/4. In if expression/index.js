/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 6);
        next();
    });
};
function f(callback) {
    g(function(err, result9) {
        if (err) {
            if (callback) {
                return callback(err)
            } else {
                throw err
            }
        };
        if ((result9 === 5)) {
            if (callback) {
                return callback(null, 6)
            };
        }
    ;
    });
};
function g(callback) {
    if (callback) {
        return callback(null, 5)
    };
};
