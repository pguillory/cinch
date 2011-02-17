var m = require('./m')

exports.test = function(next, assert) {
    m.f()
    next();
}
