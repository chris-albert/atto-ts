import {List} from 'immutable'

export type ParseResult<A> = Done<A> | Fail

export type Done<A> = {
  _type: 'done'
  value: A,
  rest : string
}

export const done: <A>(a: A, r: string) => Done<A> =
  (value, rest) => ({
    _type: 'done',
    value,
    rest,
  })

export type Fail = {
  _type: 'fail'
  input: string
  message: string
}

export const fail: (i: List<string>, m: string) => Fail = (i, message) =>({
  _type: 'fail',
  input: i.join(''),
  message
})

export type Parser<A> = {
  parse: (s: string) => ParseResult<A>
  filter: (f: (a: A) => boolean) => Parser<A>
  map: <B>(f: (a: A) => B) => Parser<B>
  flatMap: <B>(f: (a: A) => Parser<B>) => Parser<B>
  mapFail: (f: (a: Fail) => Fail) => Parser<A>
  withFailMessage: (s: string) => Parser<A>
  zip: <B>(p: Parser<B>) => Parser<[A,B]>
  zipLeft: <B>(p: Parser<B>) => Parser<A>
  zipRight: <B>(p: Parser<B>) => Parser<B>
  many: (n: number) => Parser<Array<A>>
  until: (f: (a: A) => boolean) => Parser<Array<A>>
  untilFail: () => Parser<Array<A>>
  or: <B>(p: Parser<B>) => Parser<A | B>
}

export const parser: <A>(f: (l: List<string>) => ParseResult<A>) => Parser<A> =
  <A>(func: (l: List<string>) => ParseResult<A>) => {

    const local: Parser<A> = {
      parse: str => func(List(str.split(''))),
      filter: (f: (a: A) => boolean) => {
        return parser(l => {
          const r = func(l)
          if(r._type === 'done') {
            if(f(r.value)) {
              return done(r.value, r.rest)
            } else {
              return fail(l, 'filter failed')
            }
          } else {
            return r
          }
        })
      },
      map  : <B>(f: (a: A) => B) => {
        return parser(l => {
          const r = func(l)
          if(r._type === 'done') {
            return done(f(r.value), r.rest)
          } else {
            return r
          }
        })
      },
      flatMap: <B>(f: (a: A) => Parser<B>) => {
        return parser(l => {
          const r = func(l)
          if(r._type === 'done') {
            return f(r.value).parse(r.rest)
          } else {
            return r as Fail
          }
        })
      },
      mapFail: (f: (ff: Fail) => Fail) => {
        return parser(l => {
          const r = func(l)
          if(r._type === 'done') {
            return r
          } else {
            return f(r)
          }
        })
      },
      withFailMessage: (s: string) => {
        return local.mapFail(f => fail(List(f.input.split('')), s))
      },
      zip: <B>(p: Parser<B>) => {
        return local.flatMap(a =>
          p.map(b => [a,b])
        )
      },
      zipLeft: <B>(p: Parser<B>) => {
        return local.zip(p).map(a => a[0])
      },
      zipRight: <B>(p: Parser<B>) => {
        return local.zip(p).map(a => a[1])
      },
      many: (n: number) => {
        if(n === 0) {
          return parser(l => done([], l.join('')))
        } else {
          const loop: (p: Parser<List<A>>, n: number) => Parser<Array<A>> =
            (parser, n) => {
              if (n <= 0) {
                return parser.map(l => l.toArray())
              } else {
                return parser.flatMap(a => loop(local.map(aa => a.push(aa)), n - 1))
              }
            }

          return loop(local.map(a => List.of(a)), n - 1)
        }
      },
      until: (f: (a: A) => boolean) => {

        const loop: (a: List<A>, r: List<string>) => ParseResult<Array<A>> =
          (accu, rest) => {
            const r = func(rest)
            if (r._type === 'done') {
              if (f(r.value)) {
                return done(accu.toArray(), rest.join(''))
              } else {
                return loop(accu.push(r.value), rest.shift())
              }
            } else {
              return r
            }
          }

        return parser(l => loop(List(), l))
      },
      untilFail: () => {

        const loop: (a: List<A>, r: List<string>) => ParseResult<Array<A>> =
          (accu, rest) => {
            const r = func(rest)
            if (r._type === 'done') {
              return loop(accu.push(r.value), rest.shift())
            } else {
              return done(accu.toArray(), rest.join(''))
            }
          }

        return parser(l => loop(List(), l))
      },
      or: <B>(p: Parser<B>) => {
        return parser<A | B>(l => {
          const r = func(l)
          if(r._type === 'done') {
            return r
          } else {
            return p.parse(l.join(''))
          }
        })
      }
    }
    return local
  }

