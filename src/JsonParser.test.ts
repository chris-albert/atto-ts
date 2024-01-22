import {Done, Fail, ParseIndex, Parser} from "./ParserNew";
import {jsonArray, jsonBoolean, jsonNull, jsonNumber, jsonObject, jsonString} from "./JsonParser";

test("jsonNumber", () => {
  expect(
    jsonNumber.parse("123.2")
  ).toEqual(
    Done.of(123.2,ParseIndex.of("123.2", 5))
  )
})

test("jsonBoolean (true)", () => {
  expect(
    jsonBoolean.parse("true")
  ).toEqual(
    Done.of(true,ParseIndex.of("true", 4))
  )
})

test("jsonBoolean (false)", () => {
  expect(
    jsonBoolean.parse("false")
  ).toEqual(
    Done.of(false,ParseIndex.of("false", 5))
  )
})

test("jsonBoolean fail", () => {
  expect(
    jsonBoolean.parse("asdf")
  ).toEqual(
    Fail.of("Expected boolean", ParseIndex.of("asdf", 0))
  )
})

test("jsonNull", () => {
  expect(
    jsonNull.parse("null")
  ).toEqual(
    Done.of(null, ParseIndex.of("null", 4))
  )
})

test("jsonString", () => {
  expect(
    jsonString.parse("\"asdf\"")
  ).toEqual(
    Done.of("asdf", ParseIndex.of("\"asdf\"", 6))
  )
})

/**
 * Arrays
 */

test("jsonArray, should work with empty array", () => {
  expect(
    jsonArray.parse("[]")
  ).toEqual(
    Done.of([], ParseIndex.of("[]", 2))
  )
})

test("jsonArray, should work with 1 number", () => {
  expect(
    jsonArray.parse("[1]")
  ).toEqual(
    Done.of([1], ParseIndex.of("[1]", 3))
  )
})

test("jsonArray, should work with 3 number", () => {
  expect(
    jsonArray.parse("[1,2,3]")
  ).toEqual(
    Done.of([1, 2, 3], ParseIndex.of("[1,2,3]", 7))
  )
})

test("jsonArray, should work with 3 number, with spaces", () => {
  expect(
    jsonArray.parse("[1, 2, 3]")
  ).toEqual(
    Done.of([1, 2, 3], ParseIndex.of("[1, 2, 3]", 9))
  )
})

test("jsonArray, should work with 3 number, with crazy spaces", () => {
  expect(
    jsonArray.parse("[ 1  , 2 , 3   ]")
  ).toEqual(
    Done.of([1, 2, 3], ParseIndex.of("[ 1  , 2 , 3   ]", 16))
  )
})

/**
 * Object
 */
test("jsonObject, should work with empty obj", () => {
  expect(
    jsonObject.parse("{}")
  ).toEqual(
    Done.of({}, ParseIndex.of("{}", 2))
  )
})

test("jsonObject, should work with one item", () => {
  expect(
    jsonObject.parse("{\"foo\": \"bar\"}")
  ).toEqual(
    Done.of({foo: "bar"}, ParseIndex.of("{\"foo\": \"bar\"}", 14))
  )
})

test("jsonObject, should work with many item", () => {
  expect(
    jsonObject.parse("{" +
      "\"foo1\": \"bar1\"," +
      "\"foo2\": \"bar2\"," +
      "\"foo3\": \"bar3\"" +
      "}")
  ).toEqual(
    Done.of(
      {foo1: "bar1", foo2: "bar2", foo3: "bar3"},
      ParseIndex.of("{" +
        "\"foo1\": \"bar1\"," +
        "\"foo2\": \"bar2\"," +
        "\"foo3\": \"bar3\"" +
        "}", 46)
    )
  )
})