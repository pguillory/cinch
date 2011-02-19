var cinch = require('..');
var assert = require('./assert')
var fs = require('fs')
var path = require('path')

cinch.registerExtension({
    saveSource: true,
    saveParseTree: true,
})

var tests = {}

console.log('\n*** Compiling tests ***')
fs.readdirSync(path.join(__dirname, 'tests')).forEach(function(chapter) {
    console.log('\nChapter: ' + chapter)
    fs.readdirSync(path.join(__dirname, 'tests', chapter)).forEach(function(test_name) {
        console.log('Test: ' + test_name)
        var test = require(path.join(__dirname, 'tests', chapter, test_name)).test
        tests['[' + chapter + '] ' + test_name] = test
    })
})

console.log('\n*** Running tests. ***\n');
;(function next() {
    for (var name in tests) {
        var test = tests[name];
        delete tests[name];
        console.log(name);
        return test(function() {
            process.nextTick(next)
        }, assert);
    }
    console.log('\n*** All tests passed. ***\n');
})();
