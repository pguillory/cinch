/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.is_null(err);
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    var n = 1;
    zero(function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        var i = __result_3;
        __while_loop_4();
        function __while_loop_4() {
            less_than(i, exponent, function(err, __result_5) {
                if (err) {
                    return __callback_2(err)
                };
                if (__result_5) {
                    multiply(n, base, function(err, __result_6) {
                        if (err) {
                            return __callback_2(err)
                        };
                        n = __result_6;
                        increment(i, function(err, __result_7) {
                            if (err) {
                                return __callback_2(err)
                            };
                            i = __result_7;
                            setTimeout(__while_loop_4, 0);
                        });
                    });
                }
                 else {
                    return __callback_2(null, n);
                }
            ;
            });
        };
    });
};
function zero(callback) {
    return callback(null, 0);
};
function less_than(i, exponent, callback) {
    return callback(null, (i < exponent));
};
function increment(i, callback) {
    return callback(null, (i + 1));
};
function multiply(a, b, callback) {
    return callback(null, (a * b));
};
function __throw_1(err) {if (err) {throw err}};
