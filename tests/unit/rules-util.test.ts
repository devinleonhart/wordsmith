import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  DiscordEmotes,
  Outcomes,
  ValidationError,
  buildEmoteString,
  buildPoisonedEmoteString
} from '../../src/rules-util'

describe('Rules Utilities', () => {
  describe('buildEmoteString', () => {
    it('should build correct emote string for a given count', () => {
      expect(buildEmoteString(DiscordEmotes.redDiamond, 3)).toBe(':diamonds: :diamonds: :diamonds: ')
    })

    it('should return empty string for count zero', () => {
      expect(buildEmoteString(DiscordEmotes.redDiamond, 0)).toBe('')
    })

    it('should handle a single emote', () => {
      expect(buildEmoteString(DiscordEmotes.redDiamond, 1)).toBe(':diamonds: ')
    })

    it('should work with any emote value', () => {
      expect(buildEmoteString(DiscordEmotes.star, 2)).toBe(':star2: :star2: ')
      expect(buildEmoteString(DiscordEmotes.skull, 1)).toBe(':skull_crossbones: ')
    })
  })

  describe('buildPoisonedEmoteString', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should use normal emote when random value is at or above poisoned chance', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      expect(buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 1, 0.5))
        .toBe(':diamonds: ')
    })

    it('should use poisoned emote when random value is below poisoned chance', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.49)
      expect(buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 1, 0.5))
        .toBe(':skull_crossbones: ')
    })

    it('should never use poisoned emote at chance 0', () => {
      const result = buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 3, 0)
      expect(result).toBe(':diamonds: :diamonds: :diamonds: ')
    })

    it('should always use poisoned emote at chance 1', () => {
      const result = buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 2, 1)
      expect(result).toBe(':skull_crossbones: :skull_crossbones: ')
    })

    it('should build a mixed string when random varies per emote', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.1)
      const result = buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 3, 0.5)
      expect(result).toBe(':skull_crossbones: :diamonds: :skull_crossbones: ')
    })

    it('should return empty string for count zero', () => {
      expect(buildPoisonedEmoteString(DiscordEmotes.redDiamond, DiscordEmotes.skull, 0, 0.5)).toBe('')
    })
  })

  describe('Enums', () => {
    it('should have correct DiscordEmotes values', () => {
      expect(DiscordEmotes.redDiamond).toBe(':diamonds:')
      expect(DiscordEmotes.blueDiamond).toBe(':small_blue_diamond:')
      expect(DiscordEmotes.orangeDiamond).toBe(':small_orange_diamond:')
      expect(DiscordEmotes.star).toBe(':star2:')
      expect(DiscordEmotes.skull).toBe(':skull_crossbones:')
      expect(DiscordEmotes.questionMark).toBe(':question:')
    })

    it('should have correct Outcomes values', () => {
      expect(Outcomes.failure).toBe('failure')
      expect(Outcomes.success).toBe('success')
      expect(Outcomes.partialSuccess).toBe('partial success')
      expect(Outcomes.criticalSuccess).toBe('critical success')
      expect(Outcomes.disaster).toBe('disaster')
      expect(Outcomes.unknown).toBe('unknown')
    })

    it('should have correct ValidationError messages', () => {
      expect(ValidationError.notInDiceRange).toBe('The target number must be one of the values of a d20.')
      expect(ValidationError.notEnoughPlayerDice).toBe('The number of player dice cannot be less than 1.')
      expect(ValidationError.notEnoughChallengeDice).toBe('The number of challenge dice cannot be less than 1.')
    })
  })
})
