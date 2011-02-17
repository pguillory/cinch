var m = require('./m')

exports.test = function(next, assert) {
    m.f(function(err, result) {
        assert.null(err);
        assert.true(result === 5);
        next();
    })
}
