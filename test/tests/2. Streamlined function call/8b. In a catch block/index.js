/*** Generated by streamline.js - DO NOT EDIT ***/
exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 5);
        assert.is_true(g_called);
        next();
    });
};
function f(callback) {
    return try_block(function(err) {
        if (err) {
            catch_block(err, function(err) {
                if (err) {
                    if (callback) {
                        return callback(err)
                    } else {
                        throw err
                    }
                };
                rest_block(callback);
            });
        }
         else {
            rest_block(callback);
        }
    ;
    });
    function try_block(callback) {
        {
            var err = new Error();
            if (callback) {
                return callback(err)
            } else {
                throw err
            };
        };
    };
    function catch_block(err, callback) {
        g(function(err, result15) {
            if (err) {
                if (callback) {
                    return callback(err)
                } else {
                    throw err
                }
            };
            result15;
            if (callback) {
                return callback(null)
            } else {
                return
            };
        });
    };
    function rest_block(callback) {
        if (callback) {
            return callback(null, 5)
        } else {
            return
        };
        if (callback) {
            return callback(null)
        } else {
            return
        };
    };
};
var g_called = false;
function g(callback) {
    g_called = true;
    if (callback) {
        return callback(null)
    } else {
        return
    };
};