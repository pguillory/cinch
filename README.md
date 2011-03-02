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

Features
--------
* All language features are mapped to async equivalents.
* Compiles to pure Javascript with no run-time component.
* Libraries built with Cinch can be used without it installed.
* Mix and match Cinch and non-Cinch functions.

Running Cinch code
------------------
Use included script `node-cinch` instead of `node` to run `.js_` files directly.  Or you can call `require('cinch').registerExtension()` from a running script to enable `.js_` modules to be `require()`-ed.

Alternatively, you can use `node-cinch-save` or `registerExtension({ saveSource: true })` to have it save pure-Javascript copies of your Cinch modules as `.js` files.  These are regular Javascript modules and can be used without Cinch.

History
-------
Cinch started as a fork of the excellent [Streamline.js] [1] and turned into a full rewrite.

[1]: https://github.com/Sage/streamlinejs
