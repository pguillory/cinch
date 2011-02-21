exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 5);
        next();
    });
};
var f = function(__callback_2) {
    if (true) {
        __then_block_3();
    }
     else {
        __rest_block_4();
    }
;
    function __then_block_3() {
        return __callback_2(null, 5);
    };
    function __rest_block_4() {
        return __callback_2(null);
    };
};
