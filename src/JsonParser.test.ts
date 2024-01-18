import {Done, Fail, ParseIndex, Parser} from "./ParserNew";
import {jsonBoolean, jsonNull, jsonNumber, jsonString} from "./JsonParser";

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