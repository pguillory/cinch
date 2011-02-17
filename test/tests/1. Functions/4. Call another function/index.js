var m = require('./m')

exports.test = function(next, assert) {
    m.f(function(err, result) {
        assert.true(m.g_called);
        next();
    })
}
