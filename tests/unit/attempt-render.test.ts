import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initDb } from '../../src/core/db'
import { setGm } from '../../src/features/challenge/guildRepository'
import { createSession, getSession, type RollSession } from '../../src/features/challenge/sessionRepository'
import { createCharacter } from '../../src/features/roster/characterRepository'
import { render, handleComponent } from '../../src/features/challenge/attempt'
import { type ChallengeResult } from '../../src/features/dice/engine'

const base = (over: Partial<RollSession> = {}): RollSession => ({
  id: 's1', guildId: 'g1', channelId: 'c1', messageId: null,
  playerId: 'p1', characterId: null, idea: 'jump', challengeDice: 0, creativityDice: 0,
  tags: [{ name: 'Strong', kind: 'word', on: false }, { name: 'Rope', kind: 'item', on: false }],
  status: 'proposing', result: null, createdAt: 0, ...over
})

const result: ChallengeResult = {
  player: { stars: 0, hits: 2, blanks: 1 },
  challenge: { hits: 3, blanks: 1 },
  playerHits: 2, challengeHits: 3, tier: 'partial'
}

describe('render', () => {
  it('proposing: tag select + propose button', () => {
    const v = render(base())
    expect(v.content).toContain('Player pool')
    expect(v.components).toHaveLength(2)
  })

  it('proposing with no tags: just the propose button', () => {
    const v = render(base({ tags: [] }))
    expect(v.components).toHaveLength(1)
  })

  it('awaiting_gm: veto + challenge + adjudication row; approve disabled until challenge set', () => {
    const v = render(base({ status: 'awaiting_gm', tags: [{ name: 'Strong', kind: 'word', on: true }] }))
    expect(v.content).toContain('not set')
    expect(v.components).toHaveLength(3)
  })

  it('approved: single roll button', () => {
    const v = render(base({ status: 'approved', challengeDice: 6, creativityDice: 1 }))
    expect(v.content).toContain('Final')
    expect(v.components).toHaveLength(1)
  })

  it('resolved without a star: tally, no buttons', () => {
    const v = render(base({ status: 'resolved', challengeDice: 6, result }))
    expect(v.content).toContain('PARTIAL SUCCESS')
    expect(v.components).toHaveLength(0)
  })

  it('renders a header without an idea', () => {
    const v = render(base({ idea: '' }))
    expect(v.content).toContain('makes an attempt')
  })
})

describe('render with a live character', () => {
  beforeEach(() => { initDb(':memory:') })

  it('resolved with an available star shows the Spend button', () => {
    const char = createCharacter('p1', 'Hero', true)
    const v = render(base({ status: 'resolved', challengeDice: 6, characterId: char.id, result }))
    expect(v.components).toHaveLength(1)
  })
})

describe('handleComponent edge cases', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comp = (action: string, sid: string, o: { userId: string, select?: string[] }): any => ({
    customId: `att:${action}:${sid}`,
    user: { id: o.userId }, guildId: 'g1',
    isMessageComponent: () => true, isStringSelectMenu: () => o.select !== undefined,
    values: o.select ?? [], update: vi.fn(), reply: vi.fn()
  })

  beforeEach(() => { initDb(':memory:'); setGm('g1', 'gm') })

  it('rejects an expired/unknown session', async () => {
    const i = comp('propose', 'nope', { userId: 'p1' })
    await handleComponent(i)
    expect(i.reply).toHaveBeenCalled()
    expect(i.update).not.toHaveBeenCalled()
  })

  it('rejects a player-only action from another user', async () => {
    const s = createSession({ guildId: 'g1', channelId: 'c1', playerId: 'p1', characterId: null, idea: '', tags: [] })
    const i = comp('propose', s.id, { userId: 'intruder' })
    await handleComponent(i)
    expect(i.reply).toHaveBeenCalled()
    expect(getSession(s.id)?.status).toBe('proposing')
  })

  it('lets the GM veto an invoked tag', async () => {
    const s = createSession({
      guildId: 'g1', channelId: 'c1', playerId: 'p1', characterId: null, idea: '',
      tags: [{ name: 'Strong', kind: 'word', on: true }]
    })
    await handleComponent(comp('veto', s.id, { userId: 'gm', select: ['Strong'] }))
    expect(getSession(s.id)?.tags).toHaveLength(0)
  })
})
