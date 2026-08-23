import { describe, it, expect, afterEach } from 'vitest'
import { parseDiceExpr, rollDice, formatExpr } from '../../src/features/dice/notation'
import { setRng, resetRng } from '../../src/features/dice/rules-util'

describe('parseDiceExpr', () => {
  it('parses plain NdX', () => {
    expect(parseDiceExpr('3d6')).toEqual({ count: 3, sides: 6, modifier: 0 })
  })
  it('parses a positive and negative modifier', () => {
    expect(parseDiceExpr('2d20+5')).toEqual({ count: 2, sides: 20, modifier: 5 })
    expect(parseDiceExpr('4d8-1')).toEqual({ count: 4, sides: 8, modifier: -1 })
  })
  it('tolerates whitespace', () => {
    expect(parseDiceExpr('  1 d 8  + 2 ')).toEqual({ count: 1, sides: 8, modifier: 2 })
  })
  it('rejects malformed input', () => {
    for (const bad of ['', 'd6', '3d', 'abc', '3x6', '3d6+', '-2d6']) {
      expect(parseDiceExpr(bad)).toBeNull()
    }
  })
  it('rejects out-of-range counts/sides', () => {
    expect(parseDiceExpr('0d6')).toBeNull()
    expect(parseDiceExpr('101d6')).toBeNull()
    expect(parseDiceExpr('1d1')).toBeNull()
    expect(parseDiceExpr('1d1001')).toBeNull()
  })
})

describe('rollDice', () => {
  afterEach(() => { resetRng() })

  it('rolls each die 1..sides and sums with the modifier', () => {
    setRng(() => 0.5) // floor(0.5*6)+1 = 4 on a d6
    const roll = rollDice({ count: 3, sides: 6, modifier: 2 })
    expect(roll.rolls).toEqual([4, 4, 4])
    expect(roll.total).toBe(14) // 12 + 2
  })
})

describe('formatExpr', () => {
  it('renders the canonical expression', () => {
    expect(formatExpr({ count: 3, sides: 6, modifier: 0 })).toBe('3d6')
    expect(formatExpr({ count: 2, sides: 20, modifier: 5 })).toBe('2d20+5')
    expect(formatExpr({ count: 1, sides: 8, modifier: -1 })).toBe('1d8-1')
  })
})
