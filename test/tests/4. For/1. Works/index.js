/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_null(err);
        assert.equal(result, 5);
        assert.is_true(w_called);
        assert.is_true(x_called);
        assert.is_true(y_called);
        assert.is_true(z_called);
        next();
    });
};
function f(callback) {
    callback = (callback || __throw_1);
    x(function(err, __result_2) {
        if (err) {
            return callback(err)
        };
        __result_2;
        setTimeout(__while_loop_3, 0);
        function __while_loop_3() {
            y(function(err, __result_4) {
                if (err) {
                    return callback(err)
                };
                if (__result_4) {
                    w(function(err, __result_5) {
                        if (err) {
                            return callback(err)
                        };
                        __result_5;
                        z(function(err, __result_6) {
                            if (err) {
                                return callback(err)
                            };
                            __result_6;
                            setTimeout(__while_loop_3, 0);
                        });
                    });
                }
                 else {
                    return callback(null, 5);
                }
            ;
            });
        };
    });
};
var w_called = false;
function w(callback) {
    callback = (callback || __throw_1);
    w_called = true;
    return callback(null);
};
var x_called = false;
function x(callback) {
    callback = (callback || __throw_1);
    x_called = true;
    return callback(null);
};
var y_called = false;
function y(callback) {
    callback = (callback || __throw_1);
    if (y_called) {
        return callback(null, false);
    }
     else {
        y_called = true;
        return callback(null, true);
    }
;
};
var z_called = false;
function z(callback) {
    callback = (callback || __throw_1);
    z_called = true;
    return callback(null);
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
