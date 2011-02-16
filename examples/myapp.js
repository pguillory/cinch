require('..').registerExtension();

var foo = require('./foo');
foo.fileLength(__filename, function(err, length) {
    if (err) throw err;
    console.log('Length: ' + length);
});
