import {Parser} from "./ParserNew";

type JsonArrayType = { [key: number]: JsonType}
type JsonObjectType = { [key: string]: JsonType}

export type JsonType =
  number |
  boolean |
  null |
  string |
  JsonArrayType |
  JsonObjectType

const skipWhitespace: Parser<void> =
  Parser.regex(/\s/)
    .untilFail()
    .asVoid()

export const jsonNumber: Parser<number> =
  Parser.float()
    .or(Parser.int())

export const jsonBoolean: Parser<boolean> =
  Parser.string("false")
    .as(false)
    .or(Parser.string("true").as(true))
    .withFailMessage("Expected boolean")

export const jsonNull: Parser<null> =
  Parser.string('null')
    .as(null)

export const jsonString: Parser<string> =
  Parser.char("\"")
    .zipRight(
      Parser.any()
        .untilEq("\"")
        .map(as => as.join(''))
        .skip()
    )

export const jsonArray: Parser<Array<JsonType>> =
  Parser.char('[').flatMap(() => {
    const rest = () => {
      const accu: Array<JsonType> = []
      const loop = (): Parser<Array<JsonType>> => {
        return skipWhitespace.zipRight(json().flatMap(element => {
          accu.push(element)
          return skipWhitespace.zipRight(Parser.char(",").flatMap(() => {
            return loop()
          })).or(
            skipWhitespace.zipRight(Parser.char("]")
              .flatMap(() => Parser.done(accu))
          ))
        }))
      }
      return loop()
    }
    return Parser.char(']').map(() => [])
      .or(rest())
  })

export const jsonObject: Parser<JsonObjectType> =
  Parser.char('{').flatMap(() => {
    const rest = () => {
      const accu: JsonObjectType = {}
      const loop = (): Parser<JsonObjectType> => {
        return skipWhitespace
          .zipRight(jsonString)
          .flatMap(key =>
            skipWhitespace
              .zipRight(Parser.char(":"))
              .zipRight(skipWhitespace)
              .zipRight(json())
              .flatMap(element => {
                accu[key] = element
                return skipWhitespace
                  .zipRight(
                    Parser.char(",").zipRight(loop())
                  ).or(
                    skipWhitespace
                      .zipRight(Parser.char("}"))
                      .zipRight(Parser.done(accu))
                )
              })
          )
      }
      return loop()
    }
    return Parser.char('}').map(() => ({}))
      .or(rest())
  })

export function json(): Parser<JsonType> {
  return jsonNumber
    .or(jsonBoolean)
    .or(jsonNull)
    .or(jsonString)
    .or(jsonArray)
    .or(jsonObject)
}