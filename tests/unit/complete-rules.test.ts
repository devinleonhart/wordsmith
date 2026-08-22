import { describe, it, expect, vi, afterEach } from 'vitest'
import { RollD20, roll, rollOpposed, rollRequest, rollOpposedRequest } from '../../src/features/dice/rules'
import { ValidationError } from '../../src/features/dice/rules-util'

vi.mock('fuzzy-dice', () => {
  const mockRoll = vi.fn(() => ({
    num_successes: 2,
    num_criticals: 1,
    num_blanks: 0
  }))

  const mockOpposedCheck = vi.fn(() => ({
    num_successes: 2,
    num_criticals: 1,
    num_opposed_successes: 0,
    num_dice: 3,
    num_opposed_dice: 2,
    outcome: 'success',
    magnitude: 1
  }))

  return {
    D8: vi.fn(() => ({ value: 6 })),
    D20: vi.fn(() => ({ value: 15 })),
    Dice: vi.fn().mockImplementation(function(sides, blanks, successes, crits) {
      return { sides, blanks, successes, crits, roll: vi.fn(() => ({ value: 6 })) }
    }),
    roll: mockRoll,
    opposed_check: mockOpposedCheck
  }
})

// RollD20 uses Math.floor(Math.random() * 20) + 1.
// Pin random to get a specific roll: random = (desiredRoll - 1) / 20
const pinRoll = (roll: number) => vi.spyOn(Math, 'random').mockReturnValue((roll - 1) / 20)

describe('RollD20', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should reject target numbers below 1', () => {
    expect(RollD20('Player', 0)).toBe(ValidationError.notInDiceRange)
    expect(RollD20('Player', -1)).toBe(ValidationError.notInDiceRange)
    expect(RollD20('Player', -99)).toBe(ValidationError.notInDiceRange)
  })

  it('should reject target numbers above 20', () => {
    expect(RollD20('Player', 21)).toBe(ValidationError.notInDiceRange)
    expect(RollD20('Player', 100)).toBe(ValidationError.notInDiceRange)
  })

  it('should accept the boundary values 1 and 20', () => {
    pinRoll(5)
    expect(RollD20('Player', 1)).not.toBe(ValidationError.notInDiceRange)
    expect(RollD20('Player', 20)).not.toBe(ValidationError.notInDiceRange)
  })

  it('should include the player name in the output', () => {
    pinRoll(15)
    expect(RollD20('Gandalf', 10)).toContain('Gandalf')
  })

  it('disaster — roll of 1', () => {
    pinRoll(1)
    const result = RollD20('Player', 10)
    expect(result).toContain('DISASTER')
    expect(result).toContain(':skull_crossbones:')
  })

  it('critical success — roll equals target number', () => {
    pinRoll(10)
    const result = RollD20('Player', 10)
    expect(result).toContain('CRITICAL SUCCESS')
    expect(result).toContain(':beer:')
  })

  it('critical success — roll of 20', () => {
    pinRoll(20)
    const result = RollD20('Player', 10)
    expect(result).toContain('CRITICAL SUCCESS')
    expect(result).toContain(':beer:')
  })

  it('success — roll beats target number by more than 3', () => {
    pinRoll(18)  // 18 > 10, abs(18-10) = 8 > 3
    const result = RollD20('Player', 10)
    expect(result).toContain('SUCCESS')
    expect(result).toContain(':smile_cat:')
  })

  it('partial success — roll misses target number by 3 or fewer', () => {
    pinRoll(8)  // abs(8-10) = 2 ≤ 3
    const result = RollD20('Player', 10)
    expect(result).toContain('PARTIAL SUCCESS')
    expect(result).toContain(':pouting_cat:')
  })

  it('failure — roll misses target number by more than 3', () => {
    pinRoll(4)  // abs(4-10) = 6 > 3
    const result = RollD20('Player', 10)
    expect(result).toContain('FAILURE')
    expect(result).toContain(':scream_cat:')
  })
})

describe('roll', () => {
  it('should reject zero dice', () => {
    expect(roll('Player', 0)).toBe(ValidationError.notEnoughPlayerDice)
  })

  it('should reject negative dice', () => {
    expect(roll('Player', -1)).toBe(ValidationError.notEnoughPlayerDice)
  })

  it('should include player name in result', () => {
    expect(roll('Aragorn', 3)).toContain('Aragorn')
  })

  it('should return a non-empty string for valid inputs', () => {
    const result = roll('Player', 1)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should show star emotes for criticals', () => {
    // mock returns num_criticals=1, num_successes=2
    expect(roll('Player', 3)).toContain(':star2:')
  })

  it('should show orange diamond emotes for successes', () => {
    expect(roll('Player', 3)).toContain(':small_orange_diamond:')
  })
})

describe('rollOpposed', () => {
  it('should reject zero player dice', () => {
    expect(rollOpposed('Player', 0, 2)).toBe(ValidationError.notEnoughPlayerDice)
  })

  it('should reject negative player dice', () => {
    expect(rollOpposed('Player', -1, 2)).toBe(ValidationError.notEnoughPlayerDice)
  })

  it('should reject zero challenge dice', () => {
    expect(rollOpposed('Player', 2, 0)).toBe(ValidationError.notEnoughChallengeDice)
  })

  it('should reject negative challenge dice', () => {
    expect(rollOpposed('Player', 2, -1)).toBe(ValidationError.notEnoughChallengeDice)
  })

  it('should include player name in result', () => {
    expect(rollOpposed('Legolas', 2, 2)).toContain('Legolas')
  })

  it('success outcome', async () => {
    // default mock returns outcome: 'success'
    const result = rollOpposed('Player', 2, 2)
    expect(result).toContain('SUCCESS')
    expect(result).toContain(':smile_cat:')
  })

  it('partial success outcome', async () => {
    const FuzzyDice = vi.mocked(await import('fuzzy-dice'))
    FuzzyDice.opposed_check.mockReturnValueOnce({
      num_successes: 1,
      num_criticals: 0,
      num_opposed_successes: 1,
      num_dice: 2,
      num_opposed_dice: 2,
      outcome: 'partial success',
      magnitude: 0
    })
    const result = rollOpposed('Player', 2, 2)
    expect(result).toContain('PARTIAL SUCCESS')
    expect(result).toContain(':pouting_cat:')
  })

  it('critical success outcome', async () => {
    const FuzzyDice = vi.mocked(await import('fuzzy-dice'))
    FuzzyDice.opposed_check.mockReturnValueOnce({
      num_successes: 3,
      num_criticals: 2,
      num_opposed_successes: 0,
      num_dice: 3,
      num_opposed_dice: 2,
      outcome: 'critical success',
      magnitude: 1
    })
    const result = rollOpposed('Player', 3, 2)
    expect(result).toContain('CRITICAL SUCCESS')
    expect(result).toContain(':beer:')
  })

  it('failure outcome', async () => {
    const FuzzyDice = vi.mocked(await import('fuzzy-dice'))
    FuzzyDice.opposed_check.mockReturnValueOnce({
      num_successes: 0,
      num_criticals: 0,
      num_opposed_successes: 2,
      num_dice: 2,
      num_opposed_dice: 2,
      outcome: 'failure',
      magnitude: 0
    })
    const result = rollOpposed('Player', 2, 2)
    expect(result).toContain('FAILURE')
    expect(result).toContain(':scream_cat:')
  })

  it('unknown outcome falls back to UNKNOWN', async () => {
    const FuzzyDice = vi.mocked(await import('fuzzy-dice'))
    FuzzyDice.opposed_check.mockReturnValueOnce({
      num_successes: 1,
      num_criticals: 0,
      num_opposed_successes: 1,
      num_dice: 2,
      num_opposed_dice: 2,
      outcome: 'some-unknown-outcome',
      magnitude: 0
    })
    const result = rollOpposed('Player', 2, 2)
    expect(result).toContain('UNKNOWN')
    expect(result).toContain(':question:')
  })
})

describe('rollRequest', () => {
  it('should include character name and dice count', () => {
    const result = rollRequest('Gandalf', 3)
    expect(result).toContain('Gandalf')
    expect(result).toContain('3')
  })

  it('should handle empty character name', () => {
    expect(typeof rollRequest('', 2)).toBe('string')
  })

  it('should handle large dice numbers', () => {
    const result = rollRequest('Player', 99)
    expect(result).toContain('99')
  })
})

describe('rollOpposedRequest', () => {
  it('should include character name and both dice counts', () => {
    const result = rollOpposedRequest('Gimli', 2, 3)
    expect(result).toContain('Gimli')
    expect(result).toContain('2')
    expect(result).toContain('3')
  })

  it('should handle empty character name', () => {
    expect(typeof rollOpposedRequest('', 2, 2)).toBe('string')
  })
})
