exports.test = function(next, assert) {
    f(function(err, result) {
        next();
    });
};
var f = function(__callback_2) {
    return __callback_2(null);
};
