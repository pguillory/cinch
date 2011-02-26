#!/usr/bin/env node
var cinch = require('..');
var assert = require('./assert')
var fs = require('fs')
var path = require('path')

cinch.registerExtension({
    saveSource: true,
    saveParseTree: true,
})

var tests = {}

function byParseInt(a, b) {
    return parseInt(a) - parseInt(b)
}

console.log('\n*** Compiling tests ***')
var tests_dir = path.join(__dirname, 'tests')
fs.readdirSync(tests_dir).sort(byParseInt).forEach(function(chapter) {
    console.log('\nChapter: ' + chapter)
    var chapter_dir = path.join(tests_dir, chapter)
    fs.readdirSync(chapter_dir).sort(byParseInt).forEach(function(test_name) {
        console.log('Test: ' + test_name)
        var test_dir = path.join(chapter_dir, test_name)
        var test = require(test_dir).test
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
