if (typeof require === 'function') {
    var Streamline = require('..');
    var log = console.log
} else {
    // Streamline should already have been included
    var log = function(value) {
        value = value.replace(/&/g, '&amp;')
        value = value.replace(/>/g, '&gt;')
        value = value.replace(/</g, '&lt;')
        value = value.replace(/"/g, '&quot;')
        document.write(value + '<br/>')
    }
}

var assert = {
    'true': function(value) {
        if (value !== true) {
            throw new Error('true(' + value + ')');
        }
    },
    'false': function(value) {
        if (value !== false) {
            throw new Error('false(' + value + ')');
        }
    },
    'null': function(value) {
        if (value !== null) {
            throw new Error('null(' + value + ')');
        }
    },
    'undefined': function(value) {
        if (value !== undefined) {
            throw new Error('undefined(' + value + ')');
        }
    },
    'is': function(value, prototype) {
        if (typeof value !== 'object' || value.constructor !== prototype) {
            throw new Error('is(' + value + ', ' + prototype + ')');
        }
    },
    'error': function(value) {
        if (typeof value !== 'object' || value.constructor !== Error) {
            throw new Error('error(' + value.constructor + ')');
        }
    },
}

var tests = {
    'Function with return statement': function(next) {
        function f_() {
            return 5;
        }

        eval(Streamline.transform(f_));

        f(function(err, result) {
            assert.null(err);
            assert.true(result === 5);
            next();
        })
    },

    'Function with no return statement': function(next) {
        function f_() {
        }

        eval(Streamline.transform(f_.toString()));

        f(function(err, result) {
            assert.undefined(err);
            assert.undefined(result);
            next();
        })
    },

    'Function that throws': function(next) {
        function f_() {
            throw new Error();
        }

        eval(Streamline.transform(f_.toString()));

        f(function(err, result) {
            assert.error(err);
            assert.undefined(result);
            next();
        })
    },

    'Function that calls another function': function(next) {
        function f_() {
            g();
        }
        function g() {
            this.called = true;
        }

        eval(Streamline.transform(f_.toString()));

        f(function(err, result) {
            assert.true(g.called);
            next();
        })
    },

    'Chained streamlined funcs return through': function(next) {
        function f_() {
            return g_();
        }
        function g_() {
            return 5;
        }

        eval(Streamline.transform(f_.toString() + g_.toString()));

        f(function(err, result) {
            assert.null(err);
            assert.true(result === 5);
            next();
        })
    },

    'Function called without a callback does not throw': function(next) {
        function f_() {
        }

        eval(Streamline.transform(f_.toString()));

        f(function(err, result) {
            next();
        })
    },
}

log('*** Running tests. ***');
;(function next() {
    for (var name in tests) {
        var test = tests[name];
        delete tests[name];
        log('* ' + name);
        return test(next);
    }
    log('*** All tests passed. ***');
})();
