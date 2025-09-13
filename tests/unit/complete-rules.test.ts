import { describe, it, expect, vi } from 'vitest'
import { RollD20, roll, rollOpposed, rollRequest, rollOpposedRequest } from '../../src/rules'
import { ValidationError } from '../../src/rules-util'

vi.mock('fuzzy-dice', () => {
  const mockRoll = vi.fn(() => ({
    num_successes: 2,
    num_criticals: 1,
    num_blanks: 0
  }))

  const mockOpposedCheck = vi.fn(() => ({
    player_successes: 2,
    player_criticals: 1,
    challenge_successes: 1,
    challenge_criticals: 0,
    outcome: 'success'
  }))

  return {
    D8: vi.fn(() => ({ value: 6 })),
    D20: vi.fn(() => ({ value: 15 })),
    Dice: vi.fn().mockImplementation((sides, blanks, successes, crits) => ({
      sides,
      blanks,
      successes,
      crits,
      roll: vi.fn(() => ({ value: 6 }))
    })),
    roll: mockRoll,
    opposed_check: mockOpposedCheck
  }
})

describe('Complete Rules Testing', () => {
  describe('RollD20 - Extended Coverage', () => {
    it('should handle all validation error cases', () => {
      expect(RollD20('Player', -1)).toBe(ValidationError.notInDiceRange)
      expect(RollD20('Player', 0)).toBe(ValidationError.notInDiceRange)
      expect(RollD20('Player', 21)).toBe(ValidationError.notInDiceRange)
      expect(RollD20('Player', 100)).toBe(ValidationError.notInDiceRange)
    })

    it('should work with valid range boundaries', () => {
      const result1 = RollD20('Player', 1)
      const result20 = RollD20('Player', 20)

      expect(typeof result1).toBe('string')
      expect(typeof result20).toBe('string')
      expect(result1).toContain('Player')
      expect(result20).toContain('Player')
    })

    it('should work with different player names', () => {
      const result1 = RollD20('Alice', 10)
      const result2 = RollD20('Bob', 15)
      const result3 = RollD20('', 12)

      expect(result1).toContain('Alice')
      expect(result2).toContain('Bob')
      expect(typeof result3).toBe('string')
    })
  })

  describe('roll - Extended Coverage', () => {
    it('should handle validation for negative dice', () => {
      const result = roll('Player', -1)
      expect(result).toBe(ValidationError.notEnoughPlayerDice)
    })

    it('should handle various dice counts', () => {
      const result1 = roll('Player', 1)
      const result5 = roll('Player', 5)

      expect(typeof result1).toBe('string')
      expect(typeof result5).toBe('string')

      expect(result1).toContain('Player')
      expect(result5).toContain('Player')
    })

    it('should handle edge case with zero dice', () => {
      const result = roll('TestPlayer', 0)
      expect(result).toBe(ValidationError.notEnoughPlayerDice)
    })
  })

  describe('rollOpposed - Extended Coverage', () => {
    it('should handle validation for negative player dice', () => {
      const result = rollOpposed('Player', -1, 2)
      expect(result).toBe(ValidationError.notEnoughPlayerDice)
    })

    it('should handle validation for negative challenge dice', () => {
      const result = rollOpposed('Player', 2, -1)
      expect(result).toBe(ValidationError.notEnoughChallengeDice)
    })

    it('should handle zero challenge dice', () => {
      const result = rollOpposed('Player', 2, 0)
      expect(result).toBe(ValidationError.notEnoughChallengeDice)
    })

    it('should handle zero player dice', () => {
      const result = rollOpposed('Player', 0, 2)
      expect(result).toBe(ValidationError.notEnoughPlayerDice)
    })

    it('should work with various dice combinations', () => {
      const result1 = rollOpposed('Player', 1, 1)
      const result2 = rollOpposed('Player', 3, 2)

      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')

      expect(result1).toContain('Player')
      expect(result2).toContain('Player')
    })
  })

  describe('rollRequest - Complete Coverage', () => {
    it('should return proper request messages', () => {
      const result1 = rollRequest('Gandalf', 3)
      const result2 = rollRequest('Aragorn', 1)
      const result3 = rollRequest('Legolas', 5)

      expect(result1).toContain('Gandalf')
      expect(result1).toContain('3')
      expect(result2).toContain('Aragorn')
      expect(result2).toContain('1')
      expect(result3).toContain('Legolas')
      expect(result3).toContain('5')
    })

    it('should handle special character names', () => {
      const result1 = rollRequest('Player-123', 2)
      const result2 = rollRequest('O\'Malley', 3)
      const result3 = rollRequest('Test User', 1)

      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
      expect(typeof result3).toBe('string')
    })

    it('should work with large dice numbers', () => {
      const result = rollRequest('Player', 20)
      expect(result).toContain('Player')
      expect(result).toContain('20')
    })
  })

  describe('rollOpposedRequest - Complete Coverage', () => {
    it('should return proper opposed request messages', () => {
      const result1 = rollOpposedRequest('Gimli', 2, 3)
      const result2 = rollOpposedRequest('Boromir', 4, 1)
      const result3 = rollOpposedRequest('Frodo', 1, 5)

      expect(result1).toContain('Gimli')
      expect(result1).toContain('2')
      expect(result1).toContain('3')
      expect(result2).toContain('Boromir')
      expect(result3).toContain('Frodo')
    })

    it('should handle various dice combinations in requests', () => {
      const result1 = rollOpposedRequest('Player', 1, 1)
      const result2 = rollOpposedRequest('Player', 10, 5)
      const result3 = rollOpposedRequest('Player', 3, 8)

      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
      expect(typeof result3).toBe('string')
    })

    it('should work with edge case dice numbers', () => {
      const result = rollOpposedRequest('Player', 15, 12)
      expect(result).toContain('Player')
      expect(result).toContain('15')
      expect(result).toContain('12')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle extreme values properly', () => {
      expect(RollD20('Test', 1)).not.toBe(ValidationError.notInDiceRange)
      expect(RollD20('Test', 20)).not.toBe(ValidationError.notInDiceRange)

      const largeRoll = rollRequest('Test', 999)
      expect(largeRoll).toContain('999')
    })

    it('should handle special character names', () => {
      const names = ['测试', 'José', 'François', 'Müller', '🎲Player🎲']

      names.forEach(name => {
        const result = rollRequest(name, 2)
        expect(typeof result).toBe('string')
      })
    })

    it('should maintain consistency across function calls', () => {
      for (let i = 0; i < 5; i++) {
        const d20Result = RollD20('Player', 10)
        const rollResult = roll('Player', 3)
        const opposedResult = rollOpposed('Player', 2, 2)

        expect(typeof d20Result).toBe('string')
        expect(typeof rollResult).toBe('string')
        expect(typeof opposedResult).toBe('string')
      }
    })

    it('should handle critical success outcome', async () => {
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

    it('should handle unknown/default outcome', async () => {
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
})
