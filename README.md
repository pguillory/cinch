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

The function `fileLength()` will be converted into the following:

    function fileLength(path, callback) {
        fs.readFile(path, function(err, contents) {
            if (err) return callback(err);
            return callback(null, contents.length);
        });
    };

Running Cinch code
------------------
The included script `bin/node-cinch` can be used in place of `node` to run `.js_` files directly.  Or you can call `require('cinch').registerExtension()` from a running script to enable `.js_` modules to be `require()`-ed.

Alternatively, you can use `node-cinch-save` or `registerExtension({ saveSource: true })` to have it save pure-Javascript copies of your Cinch modules as `.js` files.  These are regular Javascript modules and can be used without Cinch.

History
-------
Cinch started as a fork of [Streamline.js] [1] and turned into a full rewrite.

[1]: https://github.com/Sage/streamlinejs
