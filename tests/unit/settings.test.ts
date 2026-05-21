import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Settings', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should read WORDSMITH_SECRET_KEY from the environment', async () => {
    process.env.WORDSMITH_SECRET_KEY = 'test-secret-key'
    const settings = await import('../../src/settings')
    expect(settings.default.secretKey).toBe('test-secret-key')
  })

  it('should fall back to empty string when WORDSMITH_SECRET_KEY is absent', async () => {
    delete process.env.WORDSMITH_SECRET_KEY
    const settings = await import('../../src/settings')
    expect(settings.default.secretKey).toBe('')
  })

  it('should have the correct hardcoded client and guild IDs', async () => {
    const settings = await import('../../src/settings')
    expect(settings.default.clientID).toBe('707732906466082843')
    expect(settings.default.guildID).toBe('203642332531261441')
  })

  it('should still read WORDSMITH_SECRET_KEY in development mode', async () => {
    process.env.NODE_ENV = 'development'
    process.env.WORDSMITH_SECRET_KEY = 'dev-secret'
    const settings = await import('../../src/settings')
    expect(settings.default.secretKey).toBe('dev-secret')
  })

  it('should expose all required properties as strings', async () => {
    const settings = await import('../../src/settings')
    expect(typeof settings.default.secretKey).toBe('string')
    expect(typeof settings.default.clientID).toBe('string')
    expect(typeof settings.default.guildID).toBe('string')
  })
})
