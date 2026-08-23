import { describe, it, expect, afterEach } from 'vitest'
import {
  applyStar,
  classify,
  resolveChallenge,
  rollChallengePool,
  rollPlayerPool
} from '../../src/features/dice/engine'
import { setRng, resetRng } from '../../src/features/dice/rules-util'

// Face map: player die face < 3 = hit, === 3 = star, else blank (of 8).
// Challenge die face < 4 = hit, else blank.
const face = (n: number): number => n / 8 // rng value that floors to face n

describe('rollPlayerPool', () => {
  afterEach(() => { resetRng() })

  it('classifies faces into hit / star / blank', () => {
    const seq = [face(0), face(2), face(3), face(4), face(7)] // hit, hit, star, blank, blank
    let i = 0
    setRng(() => seq[i++])
    expect(rollPlayerPool(5)).toEqual({ stars: 1, hits: 2, blanks: 2 })
  })
})

describe('rollChallengePool', () => {
  afterEach(() => { resetRng() })

  it('counts 4/8 faces as hits', () => {
    const seq = [face(0), face(3), face(4), face(7)] // hit, hit, blank, blank
    let i = 0
    setRng(() => seq[i++])
    expect(rollChallengePool(4)).toEqual({ hits: 2, blanks: 2 })
  })
})

describe('classify', () => {
  it('2+ stars is always a crit', () => {
    expect(classify(2, 2, 5)).toBe('crit') // loses on hits but 2 stars wins
    expect(classify(3, 3, 10)).toBe('crit')
  })
  it('ties go to the player (success)', () => {
    expect(classify(0, 3, 3)).toBe('success')
    expect(classify(1, 4, 4)).toBe('success')
  })
  it('exceeding the challenge is a success', () => {
    expect(classify(0, 5, 3)).toBe('success')
  })
  it('some hits but short is a partial', () => {
    expect(classify(0, 2, 4)).toBe('partial')
    expect(classify(1, 1, 4)).toBe('partial')
  })
  it('zero hits is a disaster', () => {
    expect(classify(0, 0, 1)).toBe('disaster')
    expect(classify(0, 0, 0)).toBe('success') // 0 >= 0, ties to player
  })
})

describe('resolveChallenge', () => {
  afterEach(() => { resetRng() })

  it('produces a full structured result with star-as-hit counting', () => {
    // 3 player dice: star, hit, blank ; 2 challenge dice: hit, blank
    const seq = [face(3), face(0), face(7), face(0), face(7)]
    let i = 0
    setRng(() => seq[i++])
    const result = resolveChallenge(3, 2)
    expect(result.player).toEqual({ stars: 1, hits: 1, blanks: 1 })
    expect(result.challenge).toEqual({ hits: 1, blanks: 1 })
    expect(result.playerHits).toBe(2) // 1 star + 1 hit
    expect(result.challengeHits).toBe(1)
    expect(result.tier).toBe('success')
  })
})

describe('applyStar', () => {
  it('turns any hit into a crit, salvages a whiff to partial', () => {
    expect(applyStar('disaster')).toBe('partial')
    expect(applyStar('partial')).toBe('crit')
    expect(applyStar('success')).toBe('crit')
    expect(applyStar('crit')).toBe('crit')
  })
})
