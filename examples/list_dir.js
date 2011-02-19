require('..').registerExtension({ saveSource: true });

var path = require('path')
var file_utils = require('./file_utils');

var dir = path.join(process.cwd(), process.argv[2] || '.')

file_utils.recursive_ls(dir, 2)
