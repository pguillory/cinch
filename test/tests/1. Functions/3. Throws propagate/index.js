/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_error(err);
        assert.is_undefined(result);
        next();
    });
};
function f(callback) {
    if (callback) {
        return callback(new Error())
    } else {
        throw err
    };
};
