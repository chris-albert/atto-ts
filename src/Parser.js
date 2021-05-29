define(["require", "exports", "immutable"], function (require, exports, immutable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parser = exports.fail = exports.done = void 0;
    var done = function (value, rest) { return ({
        _type: 'done',
        value: value,
        rest: rest,
    }); };
    exports.done = done;
    var fail = function (i, message) { return ({
        _type: 'fail',
        input: i.join(''),
        message: message
    }); };
    exports.fail = fail;
    var parser = function (func) {
        var local = {
            parse: function (str) { return func(immutable_1.List(str.split(''))); },
            filter: function (f) {
                return exports.parser(function (l) {
                    var r = func(l);
                    if (r._type === 'done') {
                        if (f(r.value)) {
                            return exports.done(r.value, r.rest);
                        }
                        else {
                            return exports.fail(l, 'filter failed');
                        }
                    }
                    else {
                        return r;
                    }
                });
            },
            map: function (f) {
                return exports.parser(function (l) {
                    var r = func(l);
                    if (r._type === 'done') {
                        return exports.done(f(r.value), r.rest);
                    }
                    else {
                        return r;
                    }
                });
            },
            flatMap: function (f) {
                return exports.parser(function (l) {
                    var r = func(l);
                    if (r._type === 'done') {
                        return f(r.value).parse(r.rest);
                    }
                    else {
                        return r;
                    }
                });
            },
            mapFail: function (f) {
                return exports.parser(function (l) {
                    var r = func(l);
                    if (r._type === 'done') {
                        return r;
                    }
                    else {
                        return f(r);
                    }
                });
            },
            withFailMessage: function (s) {
                return local.mapFail(function (f) { return exports.fail(immutable_1.List(f.input.split('')), s); });
            },
            zip: function (p) {
                return local.flatMap(function (a) {
                    return p.map(function (b) { return [a, b]; });
                });
            },
            zipLeft: function (p) {
                return local.zip(p).map(function (a) { return a[0]; });
            },
            zipRight: function (p) {
                return local.zip(p).map(function (a) { return a[1]; });
            },
            many: function (n) {
                if (n === 0) {
                    return exports.parser(function (l) { return exports.done([], l.join('')); });
                }
                else {
                    var loop_1 = function (parser, n) {
                        if (n <= 0) {
                            return parser.map(function (l) { return l.toArray(); });
                        }
                        else {
                            return parser.flatMap(function (a) { return loop_1(local.map(function (aa) { return a.push(aa); }), n - 1); });
                        }
                    };
                    return loop_1(local.map(function (a) { return immutable_1.List.of(a); }), n - 1);
                }
            },
            until: function (f) {
                var loop = function (accu, rest) {
                    var r = func(rest);
                    if (r._type === 'done') {
                        if (f(r.value)) {
                            return exports.done(accu.toArray(), rest.join(''));
                        }
                        else {
                            return loop(accu.push(r.value), rest.shift());
                        }
                    }
                    else {
                        return r;
                    }
                };
                return exports.parser(function (l) { return loop(immutable_1.List(), l); });
            },
            untilFail: function () {
                var loop = function (accu, rest) {
                    var r = func(rest);
                    if (r._type === 'done') {
                        return loop(accu.push(r.value), rest.shift());
                    }
                    else {
                        return exports.done(accu.toArray(), rest.join(''));
                    }
                };
                return exports.parser(function (l) { return loop(immutable_1.List(), l); });
            },
            or: function (p) {
                return exports.parser(function (l) {
                    var r = func(l);
                    if (r._type === 'done') {
                        return r;
                    }
                    else {
                        return p.parse(l.join(''));
                    }
                });
            }
        };
        return local;
    };
    exports.parser = parser;
});
