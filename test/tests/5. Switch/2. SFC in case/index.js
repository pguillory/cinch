exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 5);
        next();
    });
};
function f(__callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    switch ("foo") {
      case "bar":
        return __rest_6();
      case "foo":
        return __case_4();
      default:
        return __case_5();
    };
    __rest_6();
;
    function __case_4() {
        return g(__callback_2);
    };
    function __case_5() {
        return __callback_2(null, 7);
    };
    function __rest_6() {
        return __callback_2(null);
    };
};
function g(callback) {
    return callback(null, 5);
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
