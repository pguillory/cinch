Cinch is a Javascript extension.  It allows you to write asynchronous, non-blocking code in a clean, synchronous form.

Cinch modules use the extension `.js_` and contain regular Javascript syntax, with one bonus.  The Cinch engine will convert any function whose name ends in an underscore into asynchronous form.  The new function will have the same name (minus the underscore) and an extra callback parameter.

Inside a converted function, you can call any asynchronous function as if it was synchronous by appending an underscore to its name.  You can mix such function calls with language constructs like `while`, `for`, `try`/`catch`, `throw`, and `return`, and they'll work as you hope.

Cinch is backwards compatible with Javascript.  Converted functions/modules can call regular functions/modules and vice versa.

Example
-------
    /* myapp.js */
    require('cinch').registerExtension({ saveSource: true });

    var mymodule = require('./mymodule');
    mymodule.fileLength(__filename, function(err, length) {
        if (err) throw err;
        console.log('Length: ' + length + ' bytes');
    });

    /* mymodule.js_ */
    function fileLength_(path) {
      if (fs.stat_(path).isFile()) {
        return fs.readFile_(path).length;
      } else {
        throw new Error(path + " is not a file");
      }
    }
    exports.fileLength = fileLength;

The `saveSource` option will cause the transformed source of cinched modules to be saved with a `.js` extension during the loading process.  These modules are pure Javascript and can be used without Cinch.

    /* mymodule.js */
    function fileLength(path, callback) {
      fs.stat(path, function(err, stat) {
        if (err) {
          return callback(err);
        }
        if (stat.isFile()) {
          fs.readFile(path, function(err, data) {
            if (err) {
              return callback(err);
            }
            callback(null, data.length);
          });
        } else {
          callback(new Error(path + " is not a file"));
        }
      });
    }
    exports.fileLength = fileLength;

History
-------
Cinch started as a fork of [Streamline.js] [1] and turned into a full rewrite.

[1]: https://github.com/Sage/streamlinejs
