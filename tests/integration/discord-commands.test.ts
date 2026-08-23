import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setRng, resetRng } from '../../src/features/dice/rules-util'

const intInteraction = (opts: Record<string, number>) => ({
  member: { user: { username: 'TestUser' } },
  options: { getInteger: vi.fn((n: string) => (n in opts ? opts[n] : null)) },
  reply: vi.fn()
})

const stringInteraction = (value: string) => ({
  options: { getString: vi.fn(() => value) },
  reply: vi.fn()
})

describe('/r (raw player pool)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  beforeEach(async () => { vi.clearAllMocks(); cmd = await import('../../src/features/dice/commands/roll') })
  afterEach(() => { resetRng() })

  it('rolls the pool and reports the hit count', async () => {
    setRng(() => 0) // all faces 0 = hits
    const interaction = intInteraction({ 'player-dice': 4 })
    await cmd.default.execute(interaction)
    const msg = interaction.reply.mock.calls[0][0] as string
    expect(msg).toContain('TestUser')
    expect(msg).toContain('**4** hits')
  })
})

describe('/ro (opposed)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  beforeEach(async () => { vi.clearAllMocks(); cmd = await import('../../src/features/dice/commands/rollOpposed') })
  afterEach(() => { resetRng() })

  it('resolves player vs challenge and shows a tier', async () => {
    setRng(() => 0) // player all hits, challenge all hits -> ties to player -> success
    const interaction = intInteraction({ 'player-dice': 3, 'challenge-dice': 3 })
    await cmd.default.execute(interaction)
    const msg = interaction.reply.mock.calls[0][0] as string
    expect(msg).toContain('SUCCESS')
    expect(msg).toContain('Player')
    expect(msg).toContain('Challenge')
  })
})

describe('/roll (notation)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  beforeEach(async () => { vi.clearAllMocks(); cmd = await import('../../src/features/dice/commands/rollNotation') })
  afterEach(() => { resetRng() })

  it('rolls a valid expression and reports the total', async () => {
    setRng(() => 0.5) // d6 -> 4
    const interaction = stringInteraction('3d6+2')
    await cmd.default.execute(interaction)
    const msg = interaction.reply.mock.calls[0][0] as string
    expect(msg).toContain('3d6+2')
    expect(msg).toContain('14') // 4+4+4+2
  })

  it('replies with an ephemeral error on malformed input', async () => {
    const interaction = stringInteraction('nonsense')
    await cmd.default.execute(interaction)
    const arg = interaction.reply.mock.calls[0][0] as { content: string, flags: number }
    expect(arg.content).toContain("Couldn't read")
    expect(arg.flags).toBeDefined()
  })
})
