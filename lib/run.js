var path = require('path');
require('..').registerExtension();

process.argv.splice(1, 1)

if (process.argv.length < 2) {
    console.log("Syntax:");
    console.log("node-cinch MYAPP.js_");
    process.exit(1);
}

var filename = path.join(process.cwd(), process.argv[1])

path.exists(filename, function(exists) {
    if (!exists) {
        console.log('File not found: ' + process.argv[1])
        process.exit(1)
    }
    
    require(filename);
})
