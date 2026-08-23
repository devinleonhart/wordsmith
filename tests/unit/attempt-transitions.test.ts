import { describe, it, expect } from 'vitest'
import {
  setInvokedTags,
  vetoTags,
  adjustCreativity,
  setChallenge
} from '../../src/features/challenge/attempt'
import { type RollSession } from '../../src/features/challenge/sessionRepository'

const make = (): RollSession => ({
  id: 's1', guildId: 'g1', channelId: 'c1', messageId: null,
  playerId: 'p1', characterId: 1, idea: '', challengeDice: 0, creativityDice: 0,
  tags: [
    { name: 'Strong', kind: 'word', on: false },
    { name: 'Rope', kind: 'item', on: false },
    { name: 'Agile', kind: 'word', on: false }
  ],
  status: 'proposing', result: null, createdAt: 0
})

describe('attempt transitions', () => {
  it('setInvokedTags turns the named tags on and the rest off', () => {
    const s = setInvokedTags(make(), ['Strong', 'Agile'])
    expect(s.tags.filter(t => t.on).map(t => t.name)).toEqual(['Strong', 'Agile'])
  })

  it('vetoTags removes tags entirely', () => {
    const s = make()
    setInvokedTags(s, ['Strong', 'Rope'])
    vetoTags(s, ['Rope'])
    expect(s.tags.map(t => t.name)).toEqual(['Strong', 'Agile'])
  })

  it('adjustCreativity clamps to 0..10', () => {
    const s = make()
    adjustCreativity(s, -1)
    expect(s.creativityDice).toBe(0)
    adjustCreativity(s, 12)
    expect(s.creativityDice).toBe(10)
    adjustCreativity(s, -3)
    expect(s.creativityDice).toBe(7)
  })

  it('setChallenge clamps to 1..10', () => {
    expect(setChallenge(make(), 0).challengeDice).toBe(1)
    expect(setChallenge(make(), 99).challengeDice).toBe(10)
    expect(setChallenge(make(), 6).challengeDice).toBe(6)
  })
})
