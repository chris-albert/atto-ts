import {Parser} from "./ParserNew";


export const jsonNumber: Parser<number> =
  Parser.float()

export const jsonBoolean: Parser<boolean> =
  Parser.string("false")
    .map(s => false)
    .or(
      Parser.string("true")
        .map(s => true)
    )
    .withFailMessage("Expected boolean")

export const jsonNull: Parser<null> =
  Parser.string('null')
    .map(s => null)

export const jsonString: Parser<string> =
  Parser.char("\"")
    .zipRight(
      Parser.any()
        .until(s => s === "\"")
        .map(as => as.join(''))
        .zipLeft(Parser.any())
    )