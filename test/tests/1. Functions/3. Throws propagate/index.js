var m = require('./m')

exports.test = function(next, assert) {
    m.f(function(err, result) {
        assert.error(err);
        assert.undefined(result);
        next();
    })
}
