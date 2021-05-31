
import _ from "lodash";
import {done, fail, parser, Parser} from "./Parser";
import {List} from "immutable";

export const any: Parser<string> = parser(chars => {
  const head = chars.first(undefined)
  if(head === undefined) {
    return fail(chars, "nothing more to parse")
  } else {
    return done(head, chars.shift().join(''))
  }
})

export const string: (s: string) => Parser<string> = c => parser(chars => {

  const loop: (s: List<string>, c: List<string>) => boolean =
    (str, comp) => {
      const sf = str.first(undefined)
      const cf = comp.first(undefined)
      if(sf !== undefined) {
        if(cf == undefined) {
          return true
        } else if(sf === cf) {
          return loop(str.shift(), comp.shift())
        }
      }
      return cf == undefined
    }

  return loop(chars, List(c.split(''))) ? done(c, chars.skip(c.length).join('')) : fail(chars, `not [${c}]`)
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

export const digits: Parser<number> =
    digit.flatMap(f =>
      digit.untilFail()
       .map(a => _.toNumber(f + a.join('')))
    )
    .withFailMessage("not digits")

export const number: Parser<number> =
  char('-')
    .flatMap(n => digits.map(n => -n))
    .or(digits)
    .withFailMessage("not number")

export const numberWithDecimal: Parser<number> =
  number.zipLeft(char('.'))
    .flatMap(s => digits.map(r => _.toNumber(`${s}.${r}`)))
    .or(number)

export const fixedNumber: (n: number) => Parser<number> = size =>
  digit.many(size).map(d =>
     _.toNumber(d.join(''))
  )
    .withFailMessage(`not fixed number size [${size}]`)

export const ubyte: Parser<number> =
  number.filter(n => n >= 0 && n < 256)
    .withFailMessage('not ubyte')
