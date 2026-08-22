import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../src/features/dice/rules', () => ({
  RollD20: vi.fn(() => 'mocked-d20-result'),
  roll: vi.fn(() => 'mocked-roll-result'),
  rollOpposed: vi.fn(() => 'mocked-rollOpposed-result'),
  rollRequest: vi.fn(() => 'mocked-rollRequest-result'),
  rollOpposedRequest: vi.fn(() => 'mocked-rollOpposedRequest-result')
}))

type OptionValue = string | number
const makeInteraction = (opts: Record<string, OptionValue> = {}, overrides: object = {}) => ({
  member: { user: { username: 'TestUser' } },
  options: {
    getInteger: vi.fn((name: string) => (typeof opts[name] === 'number' ? opts[name] : null)),
    getString: vi.fn((name: string) => (typeof opts[name] === 'string' ? opts[name] : null))
  },
  reply: vi.fn(),
  ...overrides
})

describe('d20 command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/dice/commands/d20')
  })

  it('should have correct name and description', () => {
    expect(cmd.default.data.name).toBe('d20')
    expect(cmd.default.data.description).toMatch(/d20/)
  })

  it('should call RollD20 with username and target number then reply', async () => {
    const interaction = makeInteraction({ 'target-number': 15 })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.RollD20).toHaveBeenCalledWith('TestUser', 15)
    expect(interaction.reply).toHaveBeenCalledWith('mocked-d20-result')
  })

  it('should use empty string for name when member is absent', async () => {
    const interaction = makeInteraction({ 'target-number': 10 }, { member: null })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.RollD20).toHaveBeenCalledWith('', 10)
  })

  it('should default target number to 0 when option is missing', async () => {
    const interaction = makeInteraction()
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.RollD20).toHaveBeenCalledWith('TestUser', 0)
  })
})

describe('r (roll) command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/dice/commands/roll')
  })

  it('should have correct name and description', () => {
    expect(cmd.default.data.name).toBe('r')
    expect(cmd.default.data.description).toMatch(/roll/i)
  })

  it('should call roll with username and dice count then reply', async () => {
    const interaction = makeInteraction({ 'player-dice': 3 })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.roll).toHaveBeenCalledWith('TestUser', 3)
    expect(interaction.reply).toHaveBeenCalledWith('mocked-roll-result')
  })

  it('should use empty string for name when member is absent', async () => {
    const interaction = makeInteraction({ 'player-dice': 2 }, { member: null })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.roll).toHaveBeenCalledWith('', 2)
  })

  it('should default dice to 0 when option is missing', async () => {
    const interaction = makeInteraction()
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.roll).toHaveBeenCalledWith('TestUser', 0)
  })
})

describe('ro (rollOpposed) command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/dice/commands/rollOpposed')
  })

  it('should have correct name and description', () => {
    expect(cmd.default.data.name).toBe('ro')
    expect(cmd.default.data.description).toMatch(/opposed/i)
  })

  it('should call rollOpposed with username and both dice counts then reply', async () => {
    const interaction = makeInteraction({ 'player-dice': 3, 'challenge-dice': 2 })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.rollOpposed).toHaveBeenCalledWith('TestUser', 3, 2)
    expect(interaction.reply).toHaveBeenCalledWith('mocked-rollOpposed-result')
  })

  it('should use empty string for name when member is absent', async () => {
    const interaction = makeInteraction({ 'player-dice': 2, 'challenge-dice': 2 }, { member: null })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.rollOpposed).toHaveBeenCalledWith('', 2, 2)
  })

  it('should default both dice to 0 when options are missing', async () => {
    const interaction = makeInteraction()
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.rollOpposed).toHaveBeenCalledWith('TestUser', 0, 0)
  })
})

describe('rr (rollRequest) command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/dice/commands/rollRequest')
  })

  it('should have correct name and description', () => {
    expect(cmd.default.data.name).toBe('rr')
    expect(cmd.default.data.description).toMatch(/request/i)
  })

  it('should call rollRequest with character name and dice then reply', async () => {
    const interaction = makeInteraction({ 'character-name': 'Frodo', 'player-dice': 3 })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.rollRequest).toHaveBeenCalledWith('Frodo', 3)
    expect(interaction.reply).toHaveBeenCalledWith('mocked-rollRequest-result')
  })

  it('should default character name and dice to empty/0 when options are missing', async () => {
    const interaction = makeInteraction()
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.rollRequest).toHaveBeenCalledWith('', 0)
  })
})

describe('ror (rollOpposedRequest) command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any

  beforeEach(async () => {
    vi.clearAllMocks()
    cmd = await import('../../src/features/dice/commands/rollOpposedRequest')
  })

  it('should have correct name and description', () => {
    expect(cmd.default.data.name).toBe('ror')
    expect(cmd.default.data.description).toMatch(/opposed/i)
  })

  it('should call rollOpposedRequest with all three arguments then reply', async () => {
    const interaction = makeInteraction({ 'character-name': 'Aragorn', 'player-dice': 4, 'challenge-dice': 2 })
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.rollOpposedRequest).toHaveBeenCalledWith('Aragorn', 4, 2)
    expect(interaction.reply).toHaveBeenCalledWith('mocked-rollOpposedRequest-result')
  })

  it('should default all values when options are missing', async () => {
    const interaction = makeInteraction()
    await cmd.default.execute(interaction)
    const rules = await import('../../src/features/dice/rules')
    expect(rules.rollOpposedRequest).toHaveBeenCalledWith('', 0, 0)
  })
})
