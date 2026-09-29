import { createSegmentRequestKeyPart } from './segment-value-encoding'

describe('createSegmentRequestKeyPart', () => {
  it('encodes a non-Latin1 literal segment', () => {
    // `btoa` throws `InvalidCharacterError` on non-Latin1 input, so the value
    // has to be converted to its UTF-8 bytes first.
    expect(createSegmentRequestKeyPart('тест')).toBe('!0YLQtdGB0YI')
  })

  it('encodes a non-Latin1 dynamic param name', () => {
    expect(createSegmentRequestKeyPart(['имя', 'привет', 'd'])).toBe(
      '$d$!0LjQvNGP'
    )
  })

  it('encodes a character outside the basic multilingual plane', () => {
    expect(createSegmentRequestKeyPart('🙂')).toBe('!8J-Zgg')
  })

  it('keeps simple segments as-is', () => {
    expect(createSegmentRequestKeyPart('blog')).toBe('blog')
    expect(createSegmentRequestKeyPart(['slug', 'hello', 'd'])).toBe('$d$slug')
  })
})
