import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageFlags } from 'discord.js'

vi.mock('../../src/database/mazeRepository', () => ({
  getState:       vi.fn(),
  setState:       vi.fn(),
  getVisited:     vi.fn(),
  addVisited:     vi.fn(),
  isGemCollected: vi.fn(),
  collectGem:     vi.fn(),
  initMaze:       vi.fn(),
  resetMaze:      vi.fn()
}))

vi.mock('../../src/utils/mazeLoader', () => ({
  getMaze:    vi.fn(() => ({ width: 5, height: 5, start: { x: 1, y: 1 } })),
  getSquare:  vi.fn(),
  getGoalKey: vi.fn(() => '3,3')
}))

const makeInteraction = (subcommand: string, options: Record<string, string> = {}) => ({
  guildId: 'guild-abc',
  options: {
    getSubcommand:  vi.fn(() => subcommand),
    getString:      vi.fn((name: string, _required?: boolean) => options[name] ?? null)
  },
  reply: vi.fn()
})

describe('/maze command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let repo: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let loader: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd    = await import('../../src/commands/game/maze')
    repo   = await import('../../src/database/mazeRepository')
    loader = await import('../../src/utils/mazeLoader')
  })

  it('is named maze', () => {
    expect(cmd.default.data.name).toBe('maze')
  })

  it('registers go, look, and reset subcommands', () => {
    const names = cmd.default.data.options.map((o: { name: string }) => o.name)
    expect(names).toContain('go')
    expect(names).toContain('look')
    expect(names).toContain('reset')
  })

  // ---------------------------------------------------------------------------
  // /maze go
  // ---------------------------------------------------------------------------
  describe('go subcommand', () => {
    it('replies ephemerally when moving into a hard wall', async () => {
      repo.getState.mockReturnValue({ x: 1, y: 1 })
      repo.getVisited.mockReturnValue(new Set(['1,1']))
      loader.getSquare.mockReturnValue(null)

      const interaction = makeInteraction('go', { direction: 'north' })
      await cmd.default.execute(interaction)

      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ flags: MessageFlags.Ephemeral })
      )
      expect(repo.setState).not.toHaveBeenCalled()
    })

    it('moves and replies with content when target is a passable floor', async () => {
      repo.getState.mockReturnValue({ x: 1, y: 1 })
      repo.getVisited.mockReturnValue(new Set(['1,1', '2,1']))
      repo.isGemCollected.mockReturnValue(false)
      loader.getSquare.mockReturnValue({
        x: 2, y: 1, passable: true, diggable: false, gem: null, goal: false,
        description: 'A corridor.'
      })

      const interaction = makeInteraction('go', { direction: 'east' })
      await cmd.default.execute(interaction)

      expect(repo.setState).toHaveBeenCalledWith('guild-abc', 2, 1)
      expect(repo.addVisited).toHaveBeenCalledWith('guild-abc', 2, 1)
      const content = (interaction.reply as ReturnType<typeof vi.fn>).mock.calls[0][0].content
      expect(content).toContain('A corridor.')
      expect(content).toContain('You are here.')
    })

    it('collects a gem on first entry and does not collect on subsequent visits', async () => {
      repo.getState.mockReturnValue({ x: 1, y: 1 })
      repo.getVisited.mockReturnValue(new Set(['1,1', '2,1']))
      repo.isGemCollected.mockReturnValue(false)
      loader.getSquare.mockReturnValue({
        x: 2, y: 1, passable: true, diggable: false, gem: 'emerald', goal: false,
        description: 'A gem room.'
      })

      const interaction = makeInteraction('go', { direction: 'east' })
      await cmd.default.execute(interaction)

      expect(repo.collectGem).toHaveBeenCalledWith('guild-abc', 2, 1)
      const content = (interaction.reply as ReturnType<typeof vi.fn>).mock.calls[0][0].content
      expect(content).toContain('emerald')

      vi.clearAllMocks()
      repo.getState.mockReturnValue({ x: 1, y: 1 })
      repo.getVisited.mockReturnValue(new Set(['1,1', '2,1']))
      repo.isGemCollected.mockReturnValue(true)
      loader.getSquare.mockReturnValue({
        x: 2, y: 1, passable: true, diggable: false, gem: 'emerald', goal: false,
        description: 'A gem room.'
      })
      loader.getMaze.mockReturnValue({ width: 5, height: 5, start: { x: 1, y: 1 } })
      loader.getGoalKey.mockReturnValue('3,3')

      const interaction2 = makeInteraction('go', { direction: 'east' })
      await cmd.default.execute(interaction2)

      expect(repo.collectGem).not.toHaveBeenCalled()
    })

    it('inits maze state when no state exists', async () => {
      repo.getState.mockReturnValue(null)
      repo.getVisited.mockReturnValue(new Set(['1,1', '1,2']))
      repo.isGemCollected.mockReturnValue(false)
      loader.getSquare.mockReturnValue({
        x: 1, y: 2, passable: true, diggable: false, gem: null, goal: false,
        description: 'A shaft.'
      })

      const interaction = makeInteraction('go', { direction: 'south' })
      await cmd.default.execute(interaction)

      expect(repo.initMaze).toHaveBeenCalledWith('guild-abc', 1, 1)
    })

    it('shows a digging message when moving into a diggable wall', async () => {
      repo.getState.mockReturnValue({ x: 1, y: 1 })
      repo.getVisited.mockReturnValue(new Set(['1,1', '1,2']))
      repo.isGemCollected.mockReturnValue(false)
      loader.getSquare.mockReturnValue({
        x: 1, y: 2, passable: false, diggable: true, gem: null, goal: false,
        description: 'Loose earth.'
      })

      const interaction = makeInteraction('go', { direction: 'south' })
      await cmd.default.execute(interaction)

      expect(repo.setState).toHaveBeenCalledWith('guild-abc', 1, 2)
      const content = (interaction.reply as ReturnType<typeof vi.fn>).mock.calls[0][0].content
      expect(content).toContain('swing your pick')
    })
  })

  // ---------------------------------------------------------------------------
  // /maze look
  // ---------------------------------------------------------------------------
  describe('look subcommand', () => {
    it('replies with content showing the current square description', async () => {
      repo.getState.mockReturnValue({ x: 1, y: 1 })
      repo.getVisited.mockReturnValue(new Set(['1,1']))
      loader.getSquare.mockReturnValue({
        x: 1, y: 1, passable: true, diggable: false, gem: null, goal: false,
        description: 'The entry chamber.'
      })

      const interaction = makeInteraction('look')
      await cmd.default.execute(interaction)

      const content = (interaction.reply as ReturnType<typeof vi.fn>).mock.calls[0][0].content
      expect(content).toContain('The entry chamber.')
      expect(content).toContain('You are here.')
    })

    it('inits maze when no state exists', async () => {
      repo.getState.mockReturnValue(null)
      repo.getVisited.mockReturnValue(new Set(['1,1']))
      loader.getSquare.mockReturnValue({
        x: 1, y: 1, passable: true, diggable: false, gem: null, goal: false,
        description: 'Start.'
      })

      const interaction = makeInteraction('look')
      await cmd.default.execute(interaction)

      expect(repo.initMaze).toHaveBeenCalledWith('guild-abc', 1, 1)
    })
  })

  // ---------------------------------------------------------------------------
  // /maze reset
  // ---------------------------------------------------------------------------
  describe('reset subcommand', () => {
    it('calls resetMaze and replies ephemerally', async () => {
      const interaction = makeInteraction('reset')
      await cmd.default.execute(interaction)

      expect(repo.resetMaze).toHaveBeenCalledWith('guild-abc')
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ flags: MessageFlags.Ephemeral })
      )
    })
  })
})
