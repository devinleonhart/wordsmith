import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initDb } from '../../src/core/db'
import { setGm } from '../../src/features/challenge/guildRepository'
import { createCharacter, getCharacterById } from '../../src/features/roster/characterRepository'
import { createSession, getSession, type SessionTag } from '../../src/features/challenge/sessionRepository'
import { handleComponent } from '../../src/features/challenge/attempt'
import { setRng, resetRng } from '../../src/features/dice/rules-util'

const tags: SessionTag[] = [
  { name: 'Strong', kind: 'word', on: false },
  { name: 'Rope', kind: 'item', on: false }
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const comp = (action: string, sessionId: string, o: { userId: string, select?: string[] }): any => ({
  customId: `att:${action}:${sessionId}`,
  user: { id: o.userId },
  guildId: 'g1',
  isMessageComponent: () => true,
  isStringSelectMenu: () => o.select !== undefined,
  values: o.select ?? [],
  update: vi.fn(),
  reply: vi.fn()
})

describe('/attempt full flow', () => {
  let charId: number
  let sessionId: string

  beforeEach(() => {
    initDb(':memory:')
    setGm('g1', 'gm')
    const char = createCharacter('p1', 'Hero', true) // starts with a ⭐
    charId = char.id
    sessionId = createSession({
      guildId: 'g1', channelId: 'c1', playerId: 'p1', characterId: charId, idea: 'jump', tags: [...tags]
    }).id
  })
  afterEach(() => { resetRng() })

  it('runs propose → adjudicate → roll → spend star', async () => {
    // player invokes a tag
    await handleComponent(comp('tags', sessionId, { userId: 'p1', select: ['Strong'] }))
    expect(getSession(sessionId)?.tags.find(t => t.name === 'Strong')?.on).toBe(true)

    // player proposes
    await handleComponent(comp('propose', sessionId, { userId: 'p1' }))
    expect(getSession(sessionId)?.status).toBe('awaiting_gm')

    // non-GM cannot approve
    const intruder = comp('approve', sessionId, { userId: 'someone' })
    await handleComponent(intruder)
    expect(intruder.reply).toHaveBeenCalled()
    expect(getSession(sessionId)?.status).toBe('awaiting_gm')

    // GM sets challenge 6 and adds a creativity die
    await handleComponent(comp('chal', sessionId, { userId: 'gm', select: ['6'] }))
    await handleComponent(comp('creaUp', sessionId, { userId: 'gm' }))
    expect(getSession(sessionId)?.challengeDice).toBe(6)
    expect(getSession(sessionId)?.creativityDice).toBe(1)

    // GM approves
    await handleComponent(comp('approve', sessionId, { userId: 'gm' }))
    expect(getSession(sessionId)?.status).toBe('approved')

    // player rolls — pool = base 3 + Strong + 1 creativity = 5 vs 6; all hits -> 5<6 -> partial
    setRng(() => 0)
    await handleComponent(comp('roll', sessionId, { userId: 'p1' }))
    const rolled = getSession(sessionId)
    expect(rolled?.status).toBe('resolved')
    expect(rolled?.result?.playerHits).toBe(5)
    expect(rolled?.result?.tier).toBe('partial')

    // player spends the star: partial -> crit, and the sheet's star is consumed
    await handleComponent(comp('star', sessionId, { userId: 'p1' }))
    expect(getCharacterById(charId)?.star).toBe(false)
    // session is cleaned up once no further action is possible
    expect(getSession(sessionId)).toBeNull()
  })
})
