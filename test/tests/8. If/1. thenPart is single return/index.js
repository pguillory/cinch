exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 5);
        next();
    });
};
var f = function(__callback_2) {
    if (true) {
        return __callback_2(null, 5);
    }
     else {
        return __callback_2(null);
    }
;
};
