import { describe, expect, it } from 'vitest'
import { decodeItemId, encodeItemId } from '../encodeItemsIds'

describe('encodeItemId', () => {
  it('keeps number and string ids different after stringify', () => {
    expect(encodeItemId(8)).toBe('n:8')
    expect(encodeItemId('8')).toBe('s:8')
    expect(encodeItemId(8)).not.toBe(encodeItemId('8'))
  })

  it('decodes and encodes both id types', () => {
    expect(decodeItemId(encodeItemId(8))).toBe(8)
    expect(decodeItemId(encodeItemId('8'))).toBe('8')
    expect(decodeItemId(encodeItemId('91064cef'))).toBe('91064cef')
  })
})
