var cinch = require('..')

exports.registerExtension = function(options) {
    options = options || {}

    // force require() to check for .js_ before .js
    var js_extension = require.extensions['.js']
    delete require.extensions['.js']

    require.extensions[options.extension || '.js_'] = function(module, filename) {
        var content = cinch.transformFile(filename, options)
        module._compile(content, filename)
    }

    require.extensions['.js'] = js_extension
}
