exports.test = function(next, assert) {
    f();
    next();
};
function f(__callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    return __callback_2(null);
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
