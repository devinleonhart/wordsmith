import { describe, it, expect } from 'vitest'
import { RollD20, roll, rollOpposed, rollRequest, rollOpposedRequest } from '../../src/rules'
import { ValidationError } from '../../src/rules-util'

describe('Rules Engine', () => {
  describe('RollD20', () => {
    it('should return validation error for invalid target numbers', () => {
      expect(RollD20('TestPlayer', 0)).toBe(ValidationError.notInDiceRange)
      expect(RollD20('TestPlayer', 21)).toBe(ValidationError.notInDiceRange)
      expect(RollD20('TestPlayer', -5)).toBe(ValidationError.notInDiceRange)
    })

    it('should return a string result for valid target numbers', () => {
      const result = RollD20('TestPlayer', 10)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should include player name in result', () => {
      const playerName = 'TestPlayer'
      const result = RollD20(playerName, 10)
      expect(result).toContain(playerName)
    })

    it('should handle edge cases for valid range', () => {
      expect(typeof RollD20('Test', 1)).toBe('string')
      expect(typeof RollD20('Test', 20)).toBe('string')
    })
  })

  describe('roll', () => {
    it('should handle zero dice validation', () => {
      const result = roll('TestPlayer', 0)
      expect(result).toContain('cannot be less than 1')
    })

    it('should return a string for valid dice counts', () => {
      const result = roll('TestPlayer', 3)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should include player name in result', () => {
      const playerName = 'TestPlayer'
      const result = roll(playerName, 2)
      expect(result).toContain(playerName)
    })
  })

  describe('rollOpposed', () => {
    it('should handle zero dice validation', () => {
      const result = rollOpposed('TestPlayer', 0, 2)
      expect(result).toContain('cannot be less than 1')
    })

    it('should return a string for valid parameters', () => {
      const result = rollOpposed('TestPlayer', 2, 2)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should include player name in result', () => {
      const playerName = 'TestPlayer'
      const result = rollOpposed(playerName, 2, 2)
      expect(result).toContain(playerName)
    })
  })

  describe('rollRequest', () => {
    it('should return request message for valid input', () => {
      const result = rollRequest('Gandalf', 3)
      expect(typeof result).toBe('string')
      expect(result).toContain('Gandalf')
    })

    it('should return roll request message', () => {
      const result = rollRequest('TestPlayer', 3)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle empty character name', () => {
      const result = rollRequest('', 2)
      expect(typeof result).toBe('string')
    })
  })

  describe('rollOpposedRequest', () => {
    it('should return request message for valid input', () => {
      const result = rollOpposedRequest('Aragorn', 3, 2)
      expect(typeof result).toBe('string')
      expect(result).toContain('Aragorn')
    })

    it('should return opposed roll request message', () => {
      const result = rollOpposedRequest('TestPlayer', 2, 2)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle empty character name', () => {
      const result = rollOpposedRequest('', 2, 2)
      expect(typeof result).toBe('string')
    })
  })
})
