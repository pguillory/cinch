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
        g(function(err, result14) {
            if (err) {
                if (callback) {
                    return callback(err)
                } else {
                    throw err
                }
            };
            result14;
            if (callback) {
                return callback(null)
            } else {
                return
            };
        });
    };
    function catch_block(err, callback) {
        {
            var err = err;
            if (callback) {
                return callback(err)
            } else {
                throw err
            };
        };
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