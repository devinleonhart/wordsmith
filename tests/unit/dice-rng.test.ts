import { describe, it, expect, afterEach } from 'vitest'
import { RollD20 } from '../../src/features/dice/rules'
import { setRng, resetRng, Outcomes } from '../../src/features/dice/rules-util'

describe('injectable dice RNG', () => {
  afterEach(() => { resetRng() })

  it('forces a disaster when the RNG rolls the lowest value', () => {
    setRng(() => 0) // floor(0 * 20) + 1 === 1
    const result = RollD20('Frodo', 10)
    expect(result).toContain(Outcomes.disaster.toUpperCase())
    expect(result).toContain("Frodo's Roll: 1")
  })

  it('forces a critical when the RNG rolls the highest value', () => {
    setRng(() => 0.9999) // floor(0.9999 * 20) + 1 === 20
    const result = RollD20('Frodo', 10)
    expect(result).toContain(Outcomes.criticalSuccess.toUpperCase())
    expect(result).toContain("Frodo's Roll: 20")
  })

  it('is deterministic for a fixed seed', () => {
    setRng(() => 0.5) // always 11
    expect(RollD20('P', 10)).toBe(RollD20('P', 10))
  })
})
