exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 5);
        next();
    });
};
var f = function(__callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    if (false) {
        __rest_block_5();
    }
     else {
        __else_block_4();
    }
;
;
    function __else_block_4() {
        return __callback_2(null, 5);
    };
    function __rest_block_5() {
        return __callback_2(null);
    };
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
