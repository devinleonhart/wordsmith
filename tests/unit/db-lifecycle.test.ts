import { describe, it, expect, vi } from 'vitest'

describe('db lifecycle', () => {
  it('getDb throws before initDb is called', async () => {
    vi.resetModules()
    const { getDb } = await import('../../src/core/db')
    expect(() => getDb()).toThrow(/not initialized/)
  })

  it('closeDb closes the database and is idempotent', async () => {
    vi.resetModules()
    const { initDb, getDb, closeDb } = await import('../../src/core/db')
    initDb(':memory:')
    expect(getDb().isOpen).toBe(true)

    closeDb()
    expect(getDb().isOpen).toBe(false)

    // Second call hits the `db?.isOpen === false` branch — must be a no-op.
    expect(() => {
      closeDb()
    }).not.toThrow()
  })
})
