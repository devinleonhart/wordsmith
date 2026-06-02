import { describe, it, expect } from 'vitest'
import { getMaze, getSquare, getGoalKey } from '../../src/utils/mazeLoader'

describe('getMaze', () => {
  it('returns width, height, and start coordinates', () => {
    const maze = getMaze()
    expect(maze.width).toBeGreaterThan(0)
    expect(maze.height).toBeGreaterThan(0)
    expect(maze.start).toMatchObject({ x: expect.any(Number), y: expect.any(Number) })
  })
})

describe('getSquare', () => {
  it('returns the start square', () => {
    const { start } = getMaze()
    const square = getSquare(start.x, start.y)
    expect(square).not.toBeNull()
    expect(square!.passable).toBe(true)
    expect(square!.x).toBe(start.x)
    expect(square!.y).toBe(start.y)
  })

  it('returns null for a hard wall coordinate', () => {
    expect(getSquare(0, 0)).toBeNull()
  })

  it('returns a diggable square with passable false and diggable true', () => {
    const maze = getMaze()
    let found = false
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const sq = getSquare(x, y)
        if (sq && sq.diggable) {
          expect(sq.passable).toBe(false)
          expect(sq.diggable).toBe(true)
          found = true
          break
        }
      }
      if (found) break
    }
    expect(found).toBe(true)
  })

  it('returns a gem square with a non-null gem field', () => {
    const maze = getMaze()
    let found = false
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const sq = getSquare(x, y)
        if (sq?.gem) {
          expect(typeof sq.gem).toBe('string')
          found = true
          break
        }
      }
      if (found) break
    }
    expect(found).toBe(true)
  })
})

describe('getGoalKey', () => {
  it('returns a string in "x,y" format', () => {
    expect(getGoalKey()).toMatch(/^\d+,\d+$/)
  })

  it('points to a square with goal true', () => {
    const key = getGoalKey()
    const [x, y] = key.split(',').map(Number)
    const square = getSquare(x, y)
    expect(square).not.toBeNull()
    expect(square!.goal).toBe(true)
  })
})
