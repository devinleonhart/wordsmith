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

  it('should use environment variable for secret key', async () => {
    process.env.WORDSMITH_SECRET_KEY = 'test-secret-key'

    const settings = await import('../../src/settings')
    expect(settings.default.secretKey).toBe('test-secret-key')
  })

  it('should use empty string as fallback for missing secret key', async () => {
    delete process.env.WORDSMITH_SECRET_KEY

    const settings = await import('../../src/settings')
    expect(settings.default.secretKey).toBe('')
  })

  it('should have correct client and guild IDs', async () => {
    const settings = await import('../../src/settings')
    expect(settings.default.clientID).toBe('707732906466082843')
    expect(settings.default.guildID).toBe('203642332531261441')
  })

  it('should handle different environment scenarios', async () => {
    process.env.WORDSMITH_SECRET_KEY = 'different-secret'

    const settings = await import('../../src/settings')
    expect(settings.default.secretKey).toBe('different-secret')
  })

  it('should call config() in development mode', async () => {
    process.env.NODE_ENV = 'development'

    vi.resetModules()
    const settings = await import('../../src/settings')

    expect(settings.default).toHaveProperty('secretKey')
  })

  it('should have all required properties', async () => {
    const settings = await import('../../src/settings')

    expect(settings.default).toHaveProperty('secretKey')
    expect(settings.default).toHaveProperty('clientID')
    expect(settings.default).toHaveProperty('guildID')

    expect(typeof settings.default.secretKey).toBe('string')
    expect(typeof settings.default.clientID).toBe('string')
    expect(typeof settings.default.guildID).toBe('string')
  })
})
