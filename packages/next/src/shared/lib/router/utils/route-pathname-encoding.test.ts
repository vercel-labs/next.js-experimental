import {
  decodeRoutePathname,
  encodeRoutePathnameForHeader,
} from './route-pathname-encoding'

describe('decodeRoutePathname', () => {
  it('decodes non-ASCII segments', () => {
    expect(decodeRoutePathname('/%D1%82%D0%B5%D1%81%D1%82')).toBe('/тест')
    expect(decodeRoutePathname('/%D0%B1%D0%BB%D0%BE%D0%B3/%5Bslug%5D')).toBe(
      '/блог/[slug]'
    )
  })

  it('returns the pathname unchanged when there is nothing to decode', () => {
    expect(decodeRoutePathname('/blog/hello')).toBe('/blog/hello')
    expect(decodeRoutePathname('/')).toBe('/')
  })

  it('leaves an encoded path separator encoded', () => {
    // Decoding this would change the shape of the pathname, so `/a%2Fb` must
    // not be treated as the route `/a/b`.
    expect(decodeRoutePathname('/a%2Fb')).toBe('/a%2Fb')
    expect(decodeRoutePathname('/a%5Cb')).toBe('/a%5Cb')
  })

  it('leaves an improperly encoded segment untouched', () => {
    expect(decodeRoutePathname('/%')).toBe('/%')
    expect(decodeRoutePathname('/%E0%A4%A')).toBe('/%E0%A4%A')
    expect(decodeRoutePathname('/ok/%C0%80')).toBe('/ok/%C0%80')
  })

  it('decodes the segments it can and keeps the rest', () => {
    expect(decodeRoutePathname('/%D1%82%D0%B5%D1%81%D1%82/a%2Fb')).toBe(
      '/тест/a%2Fb'
    )
  })
})

describe('encodeRoutePathnameForHeader', () => {
  it('percent-encodes non-ASCII characters', () => {
    expect(encodeRoutePathnameForHeader('/тест')).toBe(
      '/%D1%82%D0%B5%D1%81%D1%82'
    )
  })

  it('keeps the brackets of a dynamic route pattern', () => {
    expect(encodeRoutePathnameForHeader('/блог/[slug]')).toBe(
      '/%D0%B1%D0%BB%D0%BE%D0%B3/[slug]'
    )
  })

  it('leaves an ASCII pathname unchanged', () => {
    expect(encodeRoutePathnameForHeader('/blog/[slug]')).toBe('/blog/[slug]')
  })

  it('produces a value that can be used as a header', () => {
    expect(() =>
      new Headers().set('x-test', encodeRoutePathnameForHeader('/тест'))
    ).not.toThrow()
  })
})
