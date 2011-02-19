var path = require('path');
var fs = require('fs');
var cinch = require('./.');

if (process.argv.length <= 2) {
    console.log("Syntax:");
    console.log("node transform.js MYAPP.js");

    // Quit with error
    process.exit(1);
}

var filename = path.join(process.cwd(), process.argv[2]);
var contents = fs.readFileSync(filename, 'utf8');
var transformed = cinch.transform(contents);
process.stdout.write(transformed);
