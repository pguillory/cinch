var fs = require("fs");
fileLength(__filename, function(err, length) {
    if (err) {
        throw err
    };
    console.log((("I am " + length) + " bytes long"));
});
function fileLength(path, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    return fs.readFile(path, function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        return __callback_2(null, __result_3.length);
    });
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
