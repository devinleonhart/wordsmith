import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../../src/database/db'
import {
  addVisited,
  collectGem,
  getState,
  getVisited,
  initMaze,
  isGemCollected,
  resetMaze,
  setState
} from '../../src/database/mazeRepository'

beforeEach(() => {
  initDb(':memory:')
})

describe('getState', () => {
  it('returns null when no state exists', () => {
    expect(getState('guild-1')).toBeNull()
  })

  it('returns state after setState', () => {
    setState('guild-1', 3, 5)
    expect(getState('guild-1')).toEqual({ x: 3, y: 5 })
  })

  it('does not return another guilds state', () => {
    setState('guild-1', 1, 1)
    expect(getState('guild-2')).toBeNull()
  })
})

describe('setState', () => {
  it('upserts state when called twice', () => {
    setState('guild-1', 1, 1)
    setState('guild-1', 4, 7)
    expect(getState('guild-1')).toEqual({ x: 4, y: 7 })
  })
})

describe('getVisited / addVisited', () => {
  it('returns an empty set when nothing is visited', () => {
    expect(getVisited('guild-1').size).toBe(0)
  })

  it('returns visited coordinates as "x,y" keys', () => {
    addVisited('guild-1', 1, 1)
    addVisited('guild-1', 2, 3)
    const v = getVisited('guild-1')
    expect(v.has('1,1')).toBe(true)
    expect(v.has('2,3')).toBe(true)
    expect(v.size).toBe(2)
  })

  it('is idempotent — duplicate addVisited does not throw', () => {
    addVisited('guild-1', 1, 1)
    expect(() => addVisited('guild-1', 1, 1)).not.toThrow()
    expect(getVisited('guild-1').size).toBe(1)
  })

  it('does not return another guilds visited squares', () => {
    addVisited('guild-1', 1, 1)
    expect(getVisited('guild-2').size).toBe(0)
  })
})

describe('isGemCollected / collectGem', () => {
  it('returns false before a gem is collected', () => {
    expect(isGemCollected('guild-1', 3, 3)).toBe(false)
  })

  it('returns true after collectGem', () => {
    collectGem('guild-1', 3, 3)
    expect(isGemCollected('guild-1', 3, 3)).toBe(true)
  })

  it('does not affect another guild', () => {
    collectGem('guild-1', 3, 3)
    expect(isGemCollected('guild-2', 3, 3)).toBe(false)
  })

  it('is idempotent', () => {
    collectGem('guild-1', 3, 3)
    expect(() => collectGem('guild-1', 3, 3)).not.toThrow()
  })
})

describe('initMaze', () => {
  it('sets state and marks the start as visited', () => {
    initMaze('guild-1', 1, 1)
    expect(getState('guild-1')).toEqual({ x: 1, y: 1 })
    expect(getVisited('guild-1').has('1,1')).toBe(true)
  })
})

describe('resetMaze', () => {
  it('clears state, visited, and collected gems', () => {
    initMaze('guild-1', 1, 1)
    addVisited('guild-1', 2, 1)
    collectGem('guild-1', 3, 3)

    resetMaze('guild-1')

    expect(getState('guild-1')).toBeNull()
    expect(getVisited('guild-1').size).toBe(0)
    expect(isGemCollected('guild-1', 3, 3)).toBe(false)
  })

  it('does not affect another guild', () => {
    initMaze('guild-1', 1, 1)
    initMaze('guild-2', 1, 1)

    resetMaze('guild-1')

    expect(getState('guild-2')).toEqual({ x: 1, y: 1 })
  })
})
