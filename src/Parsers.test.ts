import * as P from './Parsers'
import {done, fail} from './Parser'
import {List} from "immutable";

test('any parser should work', () => {
  expect(P.any.parse("asdf"))
    .toEqual(done('a', 'sdf'))
})

test('letter parser should work', () => {
  expect(P.letter.parse("asdf"))
    .toEqual(done('a', 'sdf'))
})

test('letter parser should fail on non letter', () => {
  expect(P.letter.parse("1a"))
    .toEqual(fail(List.of('1', 'a'), 'not letter'))
})

test('digit parser should work', () => {
  expect(P.digit.parse("1abc"))
    .toEqual(done(1, 'abc'))
})

test('digit parser should fail on non digit', () => {
  expect(P.digit.parse("abc"))
    .toEqual(fail(List.of('a', 'b', 'c'), 'not digit'))
})

test('char parser should work', () => {
  expect(P.char('a').parse("asdf"))
    .toEqual(done('a', 'sdf'))
})

test('char parser should fail', () => {
  expect(P.char('a').parse("fdsa"))
    .toEqual(fail(List.of('f', 'd', 's', 'a'), 'not [a]'))
})

test('regex parser should work', () => {
  expect(P.regex(/[ad]/).parse("ac"))
    .toEqual(done('a', 'c'))
})

test('regex parser should fail', () => {
  expect(P.regex(/[ad]/).parse("c"))
    .toEqual(fail(List.of('c'), 'not [/[ad]/]'))
})

test('number parser should work', () => {
  expect(P.number.parse("123"))
    .toEqual(done(123, ''))

  expect(P.number.parse("123abc"))
    .toEqual(done(123, 'abc'))

  expect(P.number.parse("-123abc"))
    .toEqual(done(-123, 'abc'))
})

test('number parser should fail', () => {
  expect(P.number.parse("a"))
    .toEqual(fail(List.of('a'), 'not number'))
})

test('ip parser should work', async () => {

  const ipp = P.number
    .zipLeft(P.char('.'))
    .many(3)
    .flatMap(f => P.number.map(e => [...f, e]))

  expect(ipp.parse("192.168.0.1"))
    .toEqual(done([192, 168, 0, 1], ''))

})

test('date parser should work', () => {
  const date =
    P.fixedNumber(4).zipLeft(P.char('-'))
      .flatMap(y =>
        P.fixedNumber(2).zipLeft(P.char('-'))
          .flatMap(m =>
            P.fixedNumber(2)
              .map(d => [y, m, d])
          )
      )

  expect(date.parse("2021-05-29"))
    .toEqual(done([2021, 5, 29], ''))
})