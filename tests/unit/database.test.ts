import { describe, it, expect, beforeEach } from 'vitest'
import { initDb, getDb } from '../../src/database/db'

describe('initDb', () => {
  beforeEach(() => {
    initDb(':memory:')
  })

  it('creates the characters table', () => {
    const row = getDb()
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='characters'")
      .get()
    expect(row).toBeDefined()
  })

  it('creates the user_settings table', () => {
    const row = getDb()
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'")
      .get()
    expect(row).toBeDefined()
  })

  it('creates the words table', () => {
    const row = getDb()
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='words'")
      .get()
    expect(row).toBeDefined()
  })

  it('creates the items table', () => {
    const row = getDb()
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='items'")
      .get()
    expect(row).toBeDefined()
  })

  it('characters table uses star column (not has_star)', () => {
    const cols = getDb().pragma('table_info(characters)') as Array<{ name: string }>
    const names = cols.map(c => c.name)
    expect(names).toContain('star')
    expect(names).not.toContain('has_star')
  })

  it('is idempotent — calling twice does not throw', () => {
    expect(() => initDb(':memory:')).not.toThrow()
  })

  it('enables foreign key enforcement', () => {
    const row = getDb().prepare('PRAGMA foreign_keys').get() as { foreign_keys: number }
    expect(row.foreign_keys).toBe(1)
  })
})

describe('getDb', () => {
  it('returns the database instance after initDb', () => {
    initDb(':memory:')
    expect(getDb()).toBeDefined()
  })
})
