
export class ParseIndex {

  public readonly value: string
  public readonly index: number

  private constructor(value: string, index: number) {
    this.value = value
    this.index = index
  }

  focus(): string | undefined {
    if(this.index >= 0 && this.index < this.value.length) {
      return this.value[this.index]
    } else {
      return undefined
    }
  }

  next(): ParseIndex{
    return new ParseIndex(this.value, this.index + 1)
  }

  prev(): ParseIndex {
    return new ParseIndex(this.value, this.index - 1)
  }

  static of(value: string, index: number) {
    return new ParseIndex(value, index)
  }

  static value(value: string): ParseIndex {
    return new ParseIndex(value, 0)
  }
}

export interface ParseResult<A> {
  isDone(): this is Done<A> 
  isFail(): this is Fail
}

export class Done<A> implements ParseResult<A>{

  public readonly value: A
  public readonly index: ParseIndex

  private constructor(value: A, index: ParseIndex) {
    this.value = value
    this.index = index
  }

  static of<A>(value: A, index: ParseIndex): Done<A> {
    return new Done<A>(value, index)
  }

  isDone(): this is Done<A> {
    return true;
  }

  isFail(): this is Fail {
    return false;
  }
}

export class Fail implements ParseResult<never>{
  
  public readonly message: string
  public readonly index: ParseIndex

  private constructor(message: string, index: ParseIndex) {
    this.message = message
    this.index = index
  }

  static of(message: string, index: ParseIndex): Fail {
    return new Fail(message, index)
  }

  isDone(): this is Done<never> {
    return false;
  }

  isFail(): this is Fail {
    return true;
  }
}

export type ParseFunc<A> = (s: ParseIndex) => ParseResult<A>

export class Parser<A> {

  private readonly parseFunc: ParseFunc<A>

  private constructor(parseFunc: ParseFunc<A>) {
    this.parseFunc = parseFunc
  }

  filter(predicate: (a: A) => boolean): Parser<A> {
    return new Parser<A>(index => {
      const n = this.parseFunc(index)
      if(n.isDone()) {
        if(predicate(n.value)) {
          return Done.of(n.value, n.index)
        } else {
          return Fail.of("Filter failed", index)
        }
      } else {
        return n
      }
    })
  }

  map<B>(f: (a: A) => B): Parser<B> {
    return new Parser<B>(index => {
      const result = this.parseFunc(index)
      if(result.isDone()) {
        return Done.of<B>(f(result.value), result.index)
      } else {
        return result as Fail
      }
    })
  }

  flatMap<B>(f: (a: A) => Parser<B>): Parser<B> {
    return new Parser<B>(index => {
      const result = this.parseFunc(index)
      if(result.isDone()) {
        return f(result.value).parseFunc(result.index)
      } else {
        return result as Fail
      }
    })
  }

  then<B>(f: (a: A) => Parser<B>): Parser<B> {
    return this.flatMap(f)
  }

  mapFail(f: (ff: Fail) => Fail): Parser<A> {
    return new Parser<A>(index => {
      const result = this.parseFunc(index)
      if(result.isFail()) {
        return f(result)
      } else {
        return result
      }
    })
  }

  withFailMessage(message: string): Parser<A> {
    return this.mapFail(f => Fail.of(message, f.index))
  }

  zip<B>(bParser: Parser<B>): Parser<[A, B]> {
    return this.flatMap(a => bParser.map(b => [a, b]))
  }

  zipRight<B>(bParser: Parser<B>): Parser<B> {
    return this.zip(bParser).map(a => a[1])
  }

  zipLeft<B>(bParser: Parser<B>): Parser<A> {
    return this.zip(bParser).map(a => a[0])
  }

  many(count: number): Parser<Array<A>> {
    return new Parser<Array<A>>(index => {
      const accu: Array<A> = []
      const loop = (innerIndex: ParseIndex, currentCount: number): ParseResult<Array<A>> => {
        const result = this.parseFunc(innerIndex)
        if(result.isDone()) {
          if(currentCount > count - 1) {
            return Done.of(accu, innerIndex)
          } else {
            accu.push(result.value)
            return loop(innerIndex.next(), currentCount + 1)
          }
        } else {
          return result as Fail
        }
      }
      return loop(index, 0)
    })
  }

  until(predicate: (a: A) => boolean) {
    return new Parser<Array<A>>(index => {
      const accu: Array<A> = []
      const loop = (innerIndex: ParseIndex): ParseResult<Array<A>> => {
        const result = this.parseFunc(innerIndex)
        if(result.isDone()) {
          if(predicate(result.value)) {
            return Done.of(accu, innerIndex)
          } else {
            accu.push(result.value)
            return loop(innerIndex.next())
          }
        } else {
          return result as Fail
        }
      }
      return loop(index)
    })
  }

  untilFail(): Parser<Array<A>> {
    return new Parser<Array<A>>(index => {
      const accu: Array<A> = []
      const loop = (innerIndex: ParseIndex): ParseIndex => {
        const result = this.parseFunc(innerIndex)
        if(result.isDone()) {
          accu.push(result.value)
          return loop(innerIndex.next())
        } else {
          return innerIndex
        }
      }
      return Done.of(accu, loop(index))
    })
  }

  or<B>(other: Parser<B>): Parser<A | B> {
    return new Parser<A | B>(index => {
      const result = this.parseFunc(index)
      if(result.isDone()) {
        return result
      } else {
        return other.parseFunc(index)
      }
    })
  }

  static any(): Parser<string> {
    return new Parser<string>(index => {
      const v = index.focus()
      if(v === undefined) {
        return Fail.of('Nothing more to parse', index)
      } else {
        return Done.of(v, index.next())
      }
    })
  }

  static char(s: string): Parser<string> {
    return Parser.any()
      .filter(a => a === s)
      .withFailMessage(`Expected [${s}]`)
  }

  static regex(regex: RegExp): Parser<string> {
    return Parser.any()
      .filter(a => regex.test(a))
  }

  static letter(): Parser<string> {
    return Parser.regex(/[A-Za-z]/)
      .withFailMessage("Expected a letter")
  }

  static digit(): Parser<number> {
    return Parser.regex(/[0-9]/)
      .map(n => Number.parseInt(n))
      .withFailMessage("Expected a digit")
  }

  static digits(): Parser<number> {
    return Parser.digit()
      .untilFail()
      .map(na => Number.parseInt(na.join('')))
      .withFailMessage("Expected digits")
  }

  static int(): Parser<number> {
    return this.char('-')
      .flatMap(n => this.digits().map(n => -n))
      .or(this.digits())
      .withFailMessage("Not a number")
  }

  static float(): Parser<number> {
    return this.int()
      .zipLeft(this.char('.'))
      .flatMap(s => this.digits().map(d => Number.parseFloat(`${s}.${d}`)))
      .withFailMessage("Not a float")
  }

  static fixedNumber(size: number): Parser<number> {
    return this.digit()
      .many(size)
      .map(an => Number.parseInt(an.join('')))
      .withFailMessage(`Not fixed number size [${size}]`)
  }

  parse(s: string): ParseResult<A> {
    return this.parseFunc(ParseIndex.value(s))
  }
}