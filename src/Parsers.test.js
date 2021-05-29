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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
define(["require", "exports", "./Parsers", "./Parser", "immutable"], function (require, exports, P, Parser_1, immutable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    P = __importStar(P);
    test('any parser should work', function () {
        expect(P.any.parse("asdf"))
            .toEqual(Parser_1.done('a', 'sdf'));
    });
    test('letter parser should work', function () {
        expect(P.letter.parse("asdf"))
            .toEqual(Parser_1.done('a', 'sdf'));
    });
    test('letter parser should fail on non letter', function () {
        expect(P.letter.parse("1a"))
            .toEqual(Parser_1.fail(immutable_1.List.of('1', 'a'), 'not letter'));
    });
    test('digit parser should work', function () {
        expect(P.digit.parse("1abc"))
            .toEqual(Parser_1.done(1, 'abc'));
    });
    test('digit parser should fail on non digit', function () {
        expect(P.digit.parse("abc"))
            .toEqual(Parser_1.fail(immutable_1.List.of('a', 'b', 'c'), 'not digit'));
    });
    test('char parser should work', function () {
        expect(P.char('a').parse("asdf"))
            .toEqual(Parser_1.done('a', 'sdf'));
    });
    test('char parser should fail', function () {
        expect(P.char('a').parse("fdsa"))
            .toEqual(Parser_1.fail(immutable_1.List.of('f', 'd', 's', 'a'), 'not [a]'));
    });
    test('regex parser should work', function () {
        expect(P.regex(/[ad]/).parse("ac"))
            .toEqual(Parser_1.done('a', 'c'));
    });
    test('regex parser should fail', function () {
        expect(P.regex(/[ad]/).parse("c"))
            .toEqual(Parser_1.fail(immutable_1.List.of('c'), 'not [/[ad]/]'));
    });
    test('number parser should work', function () {
        expect(P.number.parse("123"))
            .toEqual(Parser_1.done(123, ''));
        expect(P.number.parse("123abc"))
            .toEqual(Parser_1.done(123, 'abc'));
        expect(P.number.parse("-123abc"))
            .toEqual(Parser_1.done(-123, 'abc'));
    });
    test('number parser should fail', function () {
        expect(P.number.parse("a"))
            .toEqual(Parser_1.fail(immutable_1.List.of('a'), 'not number'));
    });
    test('ip parser should work', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ipp;
        return __generator(this, function (_a) {
            ipp = P.number
                .zipLeft(P.char('.'))
                .many(3)
                .flatMap(function (f) { return P.number.map(function (e) { return __spreadArray(__spreadArray([], f), [e]); }); });
            expect(ipp.parse("192.168.0.1"))
                .toEqual(Parser_1.done([192, 168, 0, 1], ''));
            return [2 /*return*/];
        });
    }); });
    test('date parser should work', function () {
        var date = P.fixedNumber(4).zipLeft(P.char('-'))
            .flatMap(function (y) {
            return P.fixedNumber(2).zipLeft(P.char('-'))
                .flatMap(function (m) {
                return P.fixedNumber(2)
                    .map(function (d) { return [y, m, d]; });
            });
        });
        expect(date.parse("2021-05-29"))
            .toEqual(Parser_1.done([2021, 5, 29], ''));
    });
});