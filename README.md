Streamline.js
=============
Streamline is an extension to Javascript.  It allows you to write asynchronous, non-blocking code in a clean, synchronous form.

Streamlined modules use the extension `.js_`.  Any function whose name ends in an underscore is considered "streamlined."  The Streamline compiler will convert it into an equivalent asynchronous function in the standard last-parameter-callback form, minus the underscore suffix in the name.

Inside a streamlined function, you can call an asynchronous function as if it was synchronous by appending an underscore to its name (a "streamlined function call").  You can mix streamlined function calls with language constructs like `while` loops, `for` loops, `try`/`catch` blocks, `throw`, and `return`, and they'll work as you hope.

Streamline is backwards compatible with Javascript.  Streamlined functions/modules can call regular functions/modules and vice versa.

Example
-------
    /* myapp.js */
    require('streamline').registerExtension();

    var mymodule = require('./mymodule');
    mymodule.fileLength(argv[2], function(err, length) {
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

`mymodule.js_` will be compiled on the fly roughly into this equivalent:

    /* mymodule.js */
    function fileLength(path, callback) {
      fs.stat(path, function(err, stat) {
        if (err) return callback(err);
        if (stat.isFile()) {
          fs.readFile(path, function(err, data) {
            if (err) return callback(err);
            callback(null, data.length);
          });
        } else {
          callback(new Error(path + " is not a file"));
        }
      });
    }
    exports.fileLength = fileLength;

Known issues
------------
* Irregular `switch` statements (with `case` clauses that flow into each other) are not handled by
the transformation engine.
* Labelled `break` and `continue` are not yet supported.

Discussion
==========
For support and discussion, please join the [streamline.js Google Group](http://groups.google.com/group/streamlinejs).

License
=======
This work is licensed under the [MIT license](http://en.wikipedia.org/wiki/MIT_License).
