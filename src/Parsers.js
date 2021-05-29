var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "lodash", "./Parser"], function (require, exports, lodash_1, Parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ubyte = exports.fixedNumber = exports.number = exports.digit = exports.letter = exports.regex = exports.char = exports.any = void 0;
    lodash_1 = __importDefault(lodash_1);
    exports.any = Parser_1.parser(function (chars) {
        var head = chars.first(undefined);
        if (head === undefined) {
            return Parser_1.fail(chars, "nothing more to parse");
        }
        else {
            return Parser_1.done(head, chars.shift().join(''));
        }
    });
    var char = function (c) {
        return exports.any.filter(function (a) { return a === c; })
            .withFailMessage("not [" + c + "]");
    };
    exports.char = char;
    var regex = function (e) {
        return exports.any.filter(function (a) { return e.test(a); })
            .withFailMessage("not [" + e + "]");
    };
    exports.regex = regex;
    var letterRegex = /[A-Za-z]/;
    exports.letter = exports.regex(letterRegex)
        .withFailMessage('not letter');
    var digitRegex = /[0-9]/;
    exports.digit = exports.regex(digitRegex)
        .map(function (s) { return lodash_1.default.toNumber(s); })
        .withFailMessage('not digit');
    exports.number = exports.digit.or(exports.char('-')).flatMap(function (d) {
        return exports.digit.untilFail()
            .map(function (a) { return lodash_1.default.toNumber(d + a.join('')); });
    })
        .withFailMessage("not number");
    var fixedNumber = function (size) {
        return exports.digit.many(size).map(function (d) {
            return lodash_1.default.toNumber(d.join(''));
        })
            .withFailMessage("not fixed number size [" + size + "]");
    };
    exports.fixedNumber = fixedNumber;
    exports.ubyte = exports.number.filter(function (n) { return n >= 0 && n < 256; })
        .withFailMessage('not ubyte');
});
