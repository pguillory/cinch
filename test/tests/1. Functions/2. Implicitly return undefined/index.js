var m = require('./m')

exports.test = function(next, assert) {
    m.f(function(err, result) {
        assert.null(err);
        assert.undefined(result);
        next();
    })
}
