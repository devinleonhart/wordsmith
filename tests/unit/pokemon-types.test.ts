import { describe, it, expect } from 'vitest'
import {
  calculateTypeEffectiveness,
  getEffectivenessDescription,
  getValidTypes,
  TYPE_EFFECTIVENESS
} from '../../src/utils/pokemon-types'

describe('Pokemon Type Effectiveness', () => {
  describe('calculateTypeEffectiveness', () => {
    it('should calculate single type effectiveness correctly', () => {
      expect(calculateTypeEffectiveness('electric', ['water'])).toBe(2)
      expect(calculateTypeEffectiveness('electric', ['ground'])).toBe(0)
      expect(calculateTypeEffectiveness('electric', ['electric'])).toBe(0.5)
      expect(calculateTypeEffectiveness('normal', ['normal'])).toBe(1)
    })

    it('should calculate dual type effectiveness correctly', () => {
      expect(calculateTypeEffectiveness('electric', ['water', 'rock'])).toBe(2)
      expect(calculateTypeEffectiveness('fire', ['grass', 'ice'])).toBe(4)
      expect(calculateTypeEffectiveness('water', ['fire', 'rock'])).toBe(4)
      expect(calculateTypeEffectiveness('normal', ['ghost', 'steel'])).toBe(0)
    })

    it('should handle case insensitive input', () => {
      expect(calculateTypeEffectiveness('ELECTRIC', ['WATER'])).toBe(2)
      expect(calculateTypeEffectiveness('Electric', ['Water', 'Rock'])).toBe(2)
      expect(calculateTypeEffectiveness('fire', ['GRASS', 'ice'])).toBe(4)
    })

    it('should return 1 for unknown type matchups', () => {
      expect(calculateTypeEffectiveness('unknown', ['water'])).toBe(1)
      expect(calculateTypeEffectiveness('fire', ['unknown'])).toBe(1)
      expect(calculateTypeEffectiveness('unknown', ['unknown'])).toBe(1)
    })

    it('should handle empty defender types array', () => {
      expect(calculateTypeEffectiveness('fire', [])).toBe(1)
    })

    it('should handle single type in array format', () => {
      expect(calculateTypeEffectiveness('electric', ['water'])).toBe(2)
    })
  })

  describe('getEffectivenessDescription', () => {
    it('should return correct descriptions for standard multipliers', () => {
      expect(getEffectivenessDescription(0)).toBe("It has no effect!")
      expect(getEffectivenessDescription(0.25)).toBe("It's not very effective... (0.25×)")
      expect(getEffectivenessDescription(0.5)).toBe("It's not very effective... (0.5×)")
      expect(getEffectivenessDescription(1)).toBe("It's normally effective. (1×)")
      expect(getEffectivenessDescription(2)).toBe("It's super effective! (2×)")
      expect(getEffectivenessDescription(4)).toBe("It's extremely effective! (4×)")
    })

    it('should handle unusual multipliers', () => {
      expect(getEffectivenessDescription(1.5)).toBe("It deals 1.5× damage.")
      expect(getEffectivenessDescription(8)).toBe("It deals 8× damage.")
      expect(getEffectivenessDescription(0.1)).toBe("It deals 0.1× damage.")
    })
  })

  describe('getValidTypes', () => {
    it('should return all 18 Pokemon types', () => {
      const types = getValidTypes()
      expect(types).toHaveLength(18)
      expect(types).toContain('normal')
      expect(types).toContain('fire')
      expect(types).toContain('water')
      expect(types).toContain('grass')
      expect(types).toContain('electric')
      expect(types).toContain('ice')
      expect(types).toContain('fighting')
      expect(types).toContain('poison')
      expect(types).toContain('ground')
      expect(types).toContain('flying')
      expect(types).toContain('psychic')
      expect(types).toContain('bug')
      expect(types).toContain('rock')
      expect(types).toContain('ghost')
      expect(types).toContain('dragon')
      expect(types).toContain('dark')
      expect(types).toContain('steel')
      expect(types).toContain('fairy')
    })

    it('should return types in alphabetical order', () => {
      const types = getValidTypes()
      const sortedTypes = [...types].sort()
      expect(types).toEqual(sortedTypes)
    })
  })

  describe('TYPE_EFFECTIVENESS data integrity', () => {
    it('should have all required immunities (0x)', () => {
      expect(TYPE_EFFECTIVENESS.normal.ghost).toBe(0)
      expect(TYPE_EFFECTIVENESS.electric.ground).toBe(0)
      expect(TYPE_EFFECTIVENESS.fighting.ghost).toBe(0)
      expect(TYPE_EFFECTIVENESS.poison.steel).toBe(0)
      expect(TYPE_EFFECTIVENESS.ground.flying).toBe(0)
      expect(TYPE_EFFECTIVENESS.psychic.dark).toBe(0)
      expect(TYPE_EFFECTIVENESS.ghost.normal).toBe(0)
      expect(TYPE_EFFECTIVENESS.dragon.fairy).toBe(0)
    })

    it('should have correct super effective matchups (2x)', () => {
      expect(TYPE_EFFECTIVENESS.fire.grass).toBe(2)
      expect(TYPE_EFFECTIVENESS.water.fire).toBe(2)
      expect(TYPE_EFFECTIVENESS.grass.water).toBe(2)
      expect(TYPE_EFFECTIVENESS.electric.water).toBe(2)
      expect(TYPE_EFFECTIVENESS.ice.dragon).toBe(2)
      expect(TYPE_EFFECTIVENESS.fighting.normal).toBe(2)
    })

    it('should have correct not very effective matchups (0.5x)', () => {
      expect(TYPE_EFFECTIVENESS.fire.fire).toBe(0.5)
      expect(TYPE_EFFECTIVENESS.water.water).toBe(0.5)
      expect(TYPE_EFFECTIVENESS.grass.fire).toBe(0.5)
      expect(TYPE_EFFECTIVENESS.electric.electric).toBe(0.5)
    })
  })

  describe('Real-world examples', () => {
    it('should handle the Electric vs Water/Rock example correctly', () => {
      const multiplier = calculateTypeEffectiveness('electric', ['water', 'rock'])
      expect(multiplier).toBe(2)
    })

    it('should handle Fire vs Grass/Steel (quad effective)', () => {
      const multiplier = calculateTypeEffectiveness('fire', ['grass', 'steel'])
      expect(multiplier).toBe(4)
    })

    it('should handle Fighting vs Ghost/Normal (no effect)', () => {
      const multiplier = calculateTypeEffectiveness('fighting', ['ghost', 'normal'])
      expect(multiplier).toBe(0)
    })

    it('should handle Water vs Fire/Ground (quad effective)', () => {
      const multiplier = calculateTypeEffectiveness('water', ['fire', 'ground'])
      expect(multiplier).toBe(4)
    })
  })
})
