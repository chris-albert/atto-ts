import _ from "lodash";
import {done, fail, parser, Parser} from "./Parser";

export const any: Parser<string> = parser(chars => {
  const head = chars.first(undefined)
  if(head === undefined) {
    return fail(chars, "nothing more to parse")
  } else {
    return done(head, chars.shift().join(''))
  }
})

export const char: (s: string) => Parser<string> = c =>
  any.filter(a => a === c)
    .withFailMessage(`not [${c}]`)

export const regex: (s: RegExp) => Parser<string> = e =>
  any.filter(a => e.test(a))
    .withFailMessage(`not [${e}]`)

const letterRegex = /[A-Za-z]/

export const letter: Parser<string> =
  regex(letterRegex)
    .withFailMessage('not letter')

const digitRegex = /[0-9]/

export const digit: Parser<number> =
  regex(digitRegex)
    .map(s => _.toNumber(s))
    .withFailMessage('not digit')

export const number: Parser<number> =
  digit.or(char('-')).flatMap(d =>
    digit.untilFail()
      .map(a => _.toNumber(d + a.join('')))
  )
  .withFailMessage("not number")

export const fixedNumber: (n: number) => Parser<number> = size =>
  digit.many(size).map(d =>
     _.toNumber(d.join(''))
  )
    .withFailMessage(`not fixed number size [${size}]`)

export const ubyte: Parser<number> =
  number.filter(n => n >= 0 && n < 256)
    .withFailMessage('not ubyte')
