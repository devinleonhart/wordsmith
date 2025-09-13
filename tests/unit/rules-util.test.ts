import { describe, it, expect } from 'vitest'
import {
  DiscordEmotes,
  Outcomes,
  ValidationError,
  buildEmoteString,
  buildPoisonedEmoteString
} from '../../src/rules-util'

describe('Rules Utilities', () => {
  describe('buildEmoteString', () => {
    it('should build correct emote string for given count', () => {
      const result = buildEmoteString(DiscordEmotes.redDiamond, 3)
      expect(result).toBe(':diamonds: :diamonds: :diamonds: ')
    })

    it('should handle zero count', () => {
      const result = buildEmoteString(DiscordEmotes.redDiamond, 0)
      expect(result).toBe('')
    })

    it('should handle single emote', () => {
      const result = buildEmoteString(DiscordEmotes.redDiamond, 1)
      expect(result).toBe(':diamonds: ')
    })
  })

  describe('buildPoisonedEmoteString', () => {
    it('should build emote string with poisoned chance', () => {
      const result = buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 3, 0.5)
      expect(result.length).toBeGreaterThan(0)
      expect(result).toMatch(/(:diamonds:|:skull_crossbones:)/)
    })

    it('should handle zero poisoned chance', () => {
      const result = buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 3, 0)
      expect(result).toContain(':diamonds:')
      expect(result).not.toContain(':skull_crossbones:')
    })

    it('should handle full poisoned chance', () => {
      const result = buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 2, 1)
      expect(result).toContain(':skull_crossbones:')
      expect(result).not.toContain(':diamonds:')
    })
  })

  describe('Enums', () => {
    it('should have correct DiscordEmotes values', () => {
      expect(DiscordEmotes.redDiamond).toBe(':diamonds:')
      expect(DiscordEmotes.blueDiamond).toBe(':small_blue_diamond:')
    })

    it('should have correct Outcomes values', () => {
      expect(Outcomes.failure).toBe('failure')
      expect(Outcomes.success).toBe('success')
      expect(Outcomes.partialSuccess).toBe('partial success')
      expect(Outcomes.criticalSuccess).toBe('critical success')
    })

    it('should have correct ValidationError values', () => {
      expect(ValidationError.notInDiceRange).toBe('The target number must be one of the values of a d20.')
    })
  })
})
