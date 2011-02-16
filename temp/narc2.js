var util = require("util");
var fs = require("fs");
var narc = require("../lib/narcissus");
var tokens = narc.definitions.tokens;
var source = fs.readFileSync(__filename, "utf8");
var tree = new narc.parser.parse(source);
function strip(tree) {
    delete tree.tokenizer;
    delete tree.lineno;
    delete tree.start;
    delete tree.end;
    if (tree.children) {
        tree.children.forEach(strip);
    };
    if (tree.funDecls) {
        tree.funDecls.forEach(strip);
    };
    if (tree.initializer) {
        strip(tree.initializer);
    };
    if (tree.body) {
        strip(tree.body);
    };
    if (tree.expression) {
        strip(tree.expression);
    };
};
strip(tree);
console.log(JSON.stringify(tree));
fs.writeFileSync("narc2.js", narc.decompiler.pp(tree));