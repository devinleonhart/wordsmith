import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initDb } from '../../src/core/db'
import { WordsmithError } from '../../src/core/errors'
import { getGm } from '../../src/features/challenge/guildRepository'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const make = (sub: string, opts: { guildId?: string | null, userId?: string } = {}): any => ({
  guildId: opts.guildId === undefined ? 'g1' : opts.guildId,
  options: {
    getSubcommand: () => sub,
    getUser: () => ({ id: opts.userId ?? 'u1' })
  },
  reply: vi.fn()
})

describe('/gm command', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any
  beforeEach(async () => {
    vi.clearAllMocks()
    initDb(':memory:')
    cmd = await import('../../src/features/challenge/commands/gm')
  })

  it('set stores the GM for the guild', async () => {
    await cmd.default.execute(make('set', { userId: 'gm-user' }))
    expect(getGm('g1')).toBe('gm-user')
  })

  it('show reports the current GM', async () => {
    await cmd.default.execute(make('set', { userId: 'gm-user' }))
    const interaction = make('show')
    await cmd.default.execute(interaction)
    expect((interaction.reply.mock.calls[0][0] as { content: string }).content).toContain('gm-user')
  })

  it('show reports when no GM is set', async () => {
    const interaction = make('show')
    await cmd.default.execute(interaction)
    expect((interaction.reply.mock.calls[0][0] as { content: string }).content).toContain('No GM')
  })

  it('rejects use outside a guild', async () => {
    await expect(cmd.default.execute(make('show', { guildId: null }))).rejects.toThrow(WordsmithError)
  })
})
