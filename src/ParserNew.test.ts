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