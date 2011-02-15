var path = require('path');
var Streamline = require('.');
Streamline.register();

if (process.argv.length <= 2) {
    console.log("Syntax:");
    console.log("node run.js MYAPP.js");

    // Quit with error
    process.exit(1);
}

var filename = path.join(process.cwd(), process.argv[2]);
require(filename);
