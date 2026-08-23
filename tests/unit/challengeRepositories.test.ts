import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../../src/core/db'
import { getGm, setGm, isGm } from '../../src/features/challenge/guildRepository'
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  playerPool,
  BASE_PLAYER_DICE,
  type SessionTag
} from '../../src/features/challenge/sessionRepository'

const tags: SessionTag[] = [
  { name: 'Strong', kind: 'word', on: true },
  { name: 'Rope', kind: 'item', on: false }
]

describe('guildRepository', () => {
  beforeEach(() => { initDb(':memory:') })

  it('returns null when no GM is set', () => {
    expect(getGm('g1')).toBeNull()
    expect(isGm('g1', 'u1')).toBe(false)
  })

  it('sets and updates the GM (upsert)', () => {
    setGm('g1', 'u1')
    expect(getGm('g1')).toBe('u1')
    expect(isGm('g1', 'u1')).toBe(true)
    setGm('g1', 'u2')
    expect(getGm('g1')).toBe('u2')
    expect(isGm('g1', 'u1')).toBe(false)
  })
})

describe('sessionRepository', () => {
  beforeEach(() => { initDb(':memory:') })

  const make = () => createSession({
    guildId: 'g1', channelId: 'c1', playerId: 'p1', characterId: 7, idea: 'jump', tags: [...tags]
  })

  it('creates and reads a session with defaults', () => {
    const s = make()
    const loaded = getSession(s.id)
    expect(loaded?.idea).toBe('jump')
    expect(loaded?.status).toBe('proposing')
    expect(loaded?.challengeDice).toBe(0)
    expect(loaded?.creativityDice).toBe(0)
    expect(loaded?.result).toBeNull()
    expect(loaded?.tags).toEqual(tags)
  })

  it('computes the player pool: base + invoked tags + creativity', () => {
    const s = make()
    expect(playerPool(s)).toBe(BASE_PLAYER_DICE + 1) // 1 tag on
    s.creativityDice = 2
    expect(playerPool(s)).toBe(BASE_PLAYER_DICE + 1 + 2)
  })

  it('patches only provided fields', () => {
    const s = make()
    updateSession(s.id, { challengeDice: 6, status: 'approved' })
    const loaded = getSession(s.id)
    expect(loaded?.challengeDice).toBe(6)
    expect(loaded?.status).toBe('approved')
    expect(loaded?.idea).toBe('jump') // untouched
  })

  it('round-trips a result through JSON', () => {
    const s = make()
    const result = {
      player: { stars: 1, hits: 2, blanks: 0 },
      challenge: { hits: 1, blanks: 2 },
      playerHits: 3, challengeHits: 1, tier: 'success' as const
    }
    updateSession(s.id, { result })
    expect(getSession(s.id)?.result).toEqual(result)
  })

  it('deletes a session', () => {
    const s = make()
    deleteSession(s.id)
    expect(getSession(s.id)).toBeNull()
  })
})
