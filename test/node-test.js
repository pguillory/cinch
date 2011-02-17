var Streamline = require('..');
var log = console.log
var assert = require('./assert')
var fs = require('fs')
var path = require('path')

Streamline.registerExtension()

var tests = {}

fs.readdirSync(path.join(__dirname, 'tests')).forEach(function(chapter) {
    console.log('Chapter: ' + chapter)
    fs.readdirSync(path.join(__dirname, 'tests', chapter)).forEach(function(test_name) {
        console.log('Test: ' + test_name)
        var test = require(path.join(__dirname, 'tests', chapter, test_name)).test
        tests['[' + chapter + '] ' + test_name] = test

        //fs.unlinkSync(path.join(__dirname, 'tests', chapter, test_name, 'm.js'))
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
