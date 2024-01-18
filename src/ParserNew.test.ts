import {Done, Fail, ParseIndex, Parser} from "./ParserNew";

/**
 * any tests
 */
test("any with 1 value", () => {
  expect(
    Parser.any()
      .parse("a")
  ).toEqual(
    Done.of("a",ParseIndex.of("a", 1))
  )
})

test("any with 2 value", () => {
  expect(
    Parser.any()
      .parse("ab")
  ).toEqual(
    Done.of("a",ParseIndex.of("ab", 1))
  )
})

test("any fail with no data", () => {
  expect(
    Parser.any()
      .parse("")
  ).toEqual(
    Fail.of("Nothing more to parse", ParseIndex.of("", 0))
  )
})

/**
 * map tests
 */
test("map should work", () => {
  expect(
    Parser.any()
      .map(s => `${s}-${s}`)
      .parse("ab")
  ).toEqual(
    Done.of("a-a",ParseIndex.of("ab", 1))
  )
})

/**
 * flatMap tests
 */
test("flatMap should chain", () => {
  expect(
    Parser.any()
      .flatMap(a => Parser.any().map(b => [a, b]))
      .parse("abc")
  ).toEqual(
    Done.of(["a", "b"], ParseIndex.of("abc", 2))
  )
})

/**
 * char tests
 */

test("char should work", () => {
  expect(
    Parser.char("a")
      .parse("abc")
  ).toEqual(
    Done.of("a", ParseIndex.of("abc", 1))
  )
})

test("char should fail if not char", () => {
  expect(
    Parser.char("a")
      .parse("cba")
  ).toEqual(
    Fail.of("Expected [a]", ParseIndex.of("cba", 0))
  )
})

/**
 * letter tests
 */
test("letter should work", () => {
  expect(
    Parser.letter()
      .parse("abc")
  ).toEqual(
    Done.of("a", ParseIndex.of("abc", 1))
  )
})

test("letter should fail", () => {
  expect(
    Parser.letter()
      .parse("1bc")
  ).toEqual(
    Fail.of("Expected a letter", ParseIndex.of("1bc", 0))
  )
})

/**
 * digit tests
 */

test("digit should work", () => {
  expect(
    Parser.digit()
      .parse("1bc")
  ).toEqual(
    Done.of(1, ParseIndex.of("1bc", 1))
  )
})

test("digit should fail", () => {
  expect(
    Parser.digit()
      .parse("abc")
  ).toEqual(
    Fail.of("Expected a digit", ParseIndex.of("abc", 0))
  )
})

/**
 * digits
 */

test("digits should work, with 1 number", () => {
  expect(
    Parser.digits()
      .parse("1bc")
  ).toEqual(
    Done.of(1, ParseIndex.of("1bc", 1))
  )
})

test("digits should work, with 3 number", () => {
  expect(
    Parser.digits()
      .parse("123bc")
  ).toEqual(
    Done.of(123, ParseIndex.of("123bc", 3))
  )
})

/**
 * until
 */

test("until should work", () => {
  expect(
    Parser.any()
      .until(s => s === "c")
      .parse("1bc")
  ).toEqual(
    Done.of(Array("1", "b"), ParseIndex.of("1bc", 2))
  )
})

test("until should work, if hit on first element", () => {
  expect(
    Parser.any()
      .until(s => s === "1")
      .parse("1bc")
  ).toEqual(
    Done.of(Array(), ParseIndex.of("1bc", 0))
  )
})

/**
 * zip
 */

test("zip should work", () => {
  expect(
    Parser.letter()
      .zip(Parser.digit())
      .parse("b1c")
  ).toEqual(
    Done.of(["b", 1], ParseIndex.of("b1c", 2))
  )
})

test("zip right should work", () => {
  expect(
    Parser.letter()
      .zipRight(Parser.digit())
      .parse("b1c")
  ).toEqual(
    Done.of(1, ParseIndex.of("b1c", 2))
  )
})

test("zip left should work", () => {
  expect(
    Parser.letter()
      .zipLeft(Parser.digit())
      .parse("b1c")
  ).toEqual(
    Done.of("b", ParseIndex.of("b1c", 2))
  )
})

/**
 * many
 */

test("many should work", () => {
  expect(
    Parser.letter()
      .many(3)
      .parse("abcdefg")
  ).toEqual(
    Done.of(["a", "b", "c"], ParseIndex.of("abcdefg", 3))
  )
})

/**
 * or
 */

test("or should work for first parser", () => {
  expect(
    Parser.letter()
      .or(Parser.digit())
      .parse("abcdefg")
  ).toEqual(
    Done.of("a", ParseIndex.of("abcdefg", 1))
  )
})

test("or should work for second parser", () => {
  expect(
    Parser.letter()
      .or(Parser.digit())
      .parse("1bcdefg")
  ).toEqual(
    Done.of(1, ParseIndex.of("1bcdefg", 1))
  )
})

/**
 * int
 */

test("int should work", () => {
  expect(
    Parser.int()
      .parse("101abc")
  ).toEqual(
    Done.of(101, ParseIndex.of("101abc", 3))
  )
})

test("int should work, with negative number", () => {
  expect(
    Parser.int()
      .parse("-101abc")
  ).toEqual(
    Done.of(-101, ParseIndex.of("-101abc", 4))
  )
})

/**
 * float
 */

test("float should work", () => {
  expect(
    Parser.float()
      .parse("101.12abc")
  ).toEqual(
    Done.of(101.12, ParseIndex.of("101.12abc", 6))
  )
})

test("float should work, with negative number", () => {
  expect(
    Parser.float()
      .parse("-101.1abc")
  ).toEqual(
    Done.of(-101.1, ParseIndex.of("-101.1abc", 6))
  )
})

/**
 * fixed number
 */

test("fixedNumber should work", () => {
  expect(
    Parser.fixedNumber(3)
      .parse("12345abc")
  ).toEqual(
    Done.of(123, ParseIndex.of("12345abc", 3))
  )
})