import * as P from './Parsers'
import {done} from './Parser'

test('zipped parsers should work', () => {

  const zipped = P.letter.zip(P.digit)

  expect(zipped.parse("a1d"))
    .toEqual(done(['a', 1], 'd'))
})

test('mapped parser should work', () => {

  const mapped = P.letter.map(s => `${s}${s}`)

  expect(mapped.parse("abc"))
    .toEqual(done('aa', 'bc'))
})

test('flatMapped parser should work', () => {

  const mapped = P.letter
    .flatMap(s =>
      P.letter
        .map(ss => `${s} - ${ss}`)
    )

  expect(mapped.parse("abc"))
    .toEqual(done('a - b', 'c'))
})

test('many parser should work', () => {

  const many = P.letter.many(3)

  expect(many.parse('abcd'))
    .toEqual(done(['a', 'b', 'c'], 'd'))

  const none = P.letter.many(0)

  expect(none.parse('abcd'))
    .toEqual(done([], 'abcd'))
})

test('until parser should work', () => {

  const until = P.letter.until(s => s === 'c')

  expect(until.parse('abcd'))
    .toEqual(done(['a', 'b'], 'cd'))

  expect(until.parse('cde'))
    .toEqual(done([], 'cde'))
})

test('until fail', () => {

  const untilFail = P.letter.untilFail()

  expect(untilFail.parse('abcd'))
    .toEqual(done(['a', 'b', 'c', 'd'], ''))

  expect(untilFail.parse('ab12'))
    .toEqual(done(['a', 'b'], '12'))
})