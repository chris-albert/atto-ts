
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

  prev(): ParseIndex | undefined {
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
          return Done.of(n.value, index.next())
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
        return Done.of<B>(f(result.value), index.next())
      } else {
        return result as Fail
      }
    })
  }

  flatMap<B>(f: (a: A) => Parser<B>): Parser<B> {
    return new Parser<B>(index => {
      const result = this.parseFunc(index)
      if(result.isDone()) {
        return f(result.value).parseFunc(index.next())
      } else {
        return result as Fail
      }
    })
  }

  than<B>(f: (a: A) => Parser<B>): Parser<B> {
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

  parse(s: string): ParseResult<A> {
    return this.parseFunc(ParseIndex.value(s))
  }
}