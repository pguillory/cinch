[![build status](https://secure.travis-ci.org/pguillory/cinch.png)](http://travis-ci.org/pguillory/cinch)
Cinch is a Javascript source transformation tool.  It allows you to write asynchronous, non-blocking code in a clean, synchronous form.

Cinch modules use the extension `.js_` and contain regular Javascript syntax, with one bonus.  The Cinch engine will transform any function whose name ends in an underscore into asynchronous form.  The new function will have the same name (minus the underscore) and an extra callback parameter.

Inside a transformed function, you can call any asynchronous function (whether converted or hand-coded) as if it was synchronous by appending an underscore to its name.  You can mix such function calls with language constructs like `while`, `for`, `try`/`catch`, `throw`, and `return`, and they'll work as you hope.

Cinch is 100% compatible with regular Javascript code.  Transformed functions and regular functions can coexist in the same module and call each other freely.

Example
-------
    var fs = require('fs');

    fileLength(__filename, function(err, length) {
        if (err) throw err;
        console.log('I am ' + length + ' bytes long');
    });

    function fileLength_(path) {
        return fs.readFile_(path).length;
    };

Since `fileLength_()` ends with an underscore, Cinch will convert it into the following:

    function fileLength(path, callback) {
        fs.readFile(path, function(err, result) {
            if (err) {
              return callback(err);
            };
            return callback(null, result.length);
        });
    };

Running Cinch code
------------------
    npm install cinch
    node-cinch myfile.js_

As `.js_` modules are loaded, Cinch will save pure-Javascript versions with the `.js` extension.  These are regular modules and can be used without Cinch present.

API
---
`cinch.registerExtension()`

Hooks into `require()` functionality to allow `.js_` modules to be loaded.

`cinch.transform(source)`

Transforms a single script and returns the pure-JS version.

History
-------
Cinch started as a fork of the excellent [Streamline.js] [1] and turned into a full rewrite.

[1]: https://github.com/Sage/streamlinejs
