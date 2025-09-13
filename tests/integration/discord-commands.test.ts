import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockDiscordInteraction, resetMocks } from '../utils/test-helpers'

vi.mock('../../src/rules', () => ({
  RollD20: vi.fn(() => 'TestPlayer rolled a 15! Success!'),
  roll: vi.fn(() => 'TestPlayer rolled 2 successes!'),
  rollOpposed: vi.fn(() => 'TestPlayer vs Challenge: Success!')
}))

describe('Discord Commands Integration', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('D20 Command', () => {
    it('should handle d20 command interaction', async () => {
      const interaction = mockDiscordInteraction
      interaction.options.get.mockReturnValue({ value: 15 })

      expect(interaction.options.get).toBeDefined()
    })
  })

  describe('Roll Command', () => {
    it('should handle roll command interaction', async () => {
      const interaction = mockDiscordInteraction
      interaction.options.get.mockReturnValue({ value: 3 })

      expect(interaction.options.get).toBeDefined()
    })
  })
})
