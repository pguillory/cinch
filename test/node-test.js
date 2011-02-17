var Streamline = require('..');
var log = console.log
var assert = require('./assert')
var fs = require('fs')
var path = require('path')

Streamline.registerExtension()

var tests = {
    'Function that calls another function': function(next) {
        function f_() {
            g();
        }
        var g_called = false
        function g() {
            g_called = true;
        }

        var t = Streamline.transform(f_.toString())
        eval(t);

        f(function(err, result) {
            assert.true(g_called);
            next();
        })
    },

    'Chained streamlined funcs return through': function(next) {
        function f_() {
            return g_();
        }
        function g(callback) {
            return callback(null, 5)
        }

        var t = Streamline.transform(f_.toString())
        eval(t);

        f(function(err, result) {
            assert.null(err);
            assert.true(result === 5);
            next();
        })
    },

    'Function called without a callback does not throw': function(next) {
        function f_() {
        }

        var t = Streamline.transform(f_.toString())
        eval(t);

        f()
        next();
    },
}

fs.readdirSync(path.join(__dirname, 'tests')).forEach(function(chapter) {
    console.log('scanning chapter: ' + chapter)
    fs.readdirSync(path.join(__dirname, 'tests', chapter)).forEach(function(test_name) {
        console.log('adding test: ' + test_name)
        var test = require(path.join(__dirname, 'tests', chapter, test_name)).test
        //fs.unlinkSync(path.join(__dirname, 'tests', chapter, test_name, 'm.js'))
        tests['[' + chapter + '] ' + test_name] = test
    })
})

log('*** Running tests. ***');
;(function next() {
    for (var name in tests) {
        var test = tests[name];
        delete tests[name];
        log('* ' + name);
        return test(next, assert);
    }
    log('*** All tests passed. ***');
})();
