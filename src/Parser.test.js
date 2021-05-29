var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define(["require", "exports", "./Parsers", "./Parser"], function (require, exports, P, Parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    P = __importStar(P);
    test('zipped parsers should work', function () {
        var zipped = P.letter.zip(P.digit);
        expect(zipped.parse("a1d"))
            .toEqual(Parser_1.done(['a', 1], 'd'));
    });
    test('mapped parser should work', function () {
        var mapped = P.letter.map(function (s) { return "" + s + s; });
        expect(mapped.parse("abc"))
            .toEqual(Parser_1.done('aa', 'bc'));
    });
    test('flatMapped parser should work', function () {
        var mapped = P.letter
            .flatMap(function (s) {
            return P.letter
                .map(function (ss) { return s + " - " + ss; });
        });
        expect(mapped.parse("abc"))
            .toEqual(Parser_1.done('a - b', 'c'));
    });
    test('many parser should work', function () {
        var many = P.letter.many(3);
        expect(many.parse('abcd'))
            .toEqual(Parser_1.done(['a', 'b', 'c'], 'd'));
        var none = P.letter.many(0);
        expect(none.parse('abcd'))
            .toEqual(Parser_1.done([], 'abcd'));
    });
    test('until parser should work', function () {
        var until = P.letter.until(function (s) { return s === 'c'; });
        expect(until.parse('abcd'))
            .toEqual(Parser_1.done(['a', 'b'], 'cd'));
        expect(until.parse('cde'))
            .toEqual(Parser_1.done([], 'cde'));
    });
    test('until fail', function () {
        var untilFail = P.letter.untilFail();
        expect(untilFail.parse('abcd'))
            .toEqual(Parser_1.done(['a', 'b', 'c', 'd'], ''));
        expect(untilFail.parse('ab12'))
            .toEqual(Parser_1.done(['a', 'b'], '12'));
    });
});
