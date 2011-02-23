exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 5);
        next();
    });
};
var f = function(__callback_2) {
    if (false) {
        return __callback_2(null);
    }
     else {
        return __callback_2(null, 5);
    }
;
};
