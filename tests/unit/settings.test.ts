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
    const settings = await import('../../src/core/settings')
    expect(settings.default.secretKey).toBe('test-secret-key')
  })

  it('should fall back to empty string when WORDSMITH_SECRET_KEY is absent', async () => {
    delete process.env.WORDSMITH_SECRET_KEY
    const settings = await import('../../src/core/settings')
    expect(settings.default.secretKey).toBe('')
  })

  it('should default the client and guild IDs when env vars are unset', async () => {
    delete process.env.WORDSMITH_CLIENT_ID
    delete process.env.WORDSMITH_GUILD_ID
    const settings = await import('../../src/core/settings')
    expect(settings.default.clientID).toBe('707732906466082843')
    expect(settings.default.guildID).toBe('203642332531261441')
  })

  it('should let WORDSMITH_CLIENT_ID and WORDSMITH_GUILD_ID override the defaults', async () => {
    process.env.WORDSMITH_CLIENT_ID = '111'
    process.env.WORDSMITH_GUILD_ID = '222'
    const settings = await import('../../src/core/settings')
    expect(settings.default.clientID).toBe('111')
    expect(settings.default.guildID).toBe('222')
  })

  it('should still read WORDSMITH_SECRET_KEY in development mode', async () => {
    process.env.NODE_ENV = 'development'
    process.env.WORDSMITH_SECRET_KEY = 'dev-secret'
    const settings = await import('../../src/core/settings')
    expect(settings.default.secretKey).toBe('dev-secret')
  })

  it('should expose all required properties as strings', async () => {
    const settings = await import('../../src/core/settings')
    expect(typeof settings.default.secretKey).toBe('string')
    expect(typeof settings.default.clientID).toBe('string')
    expect(typeof settings.default.guildID).toBe('string')
  })

  describe('assertConfig', () => {
    it('should throw when the secret key is missing', async () => {
      const { assertConfig } = await import('../../src/core/settings')
      expect(() => { assertConfig({ clientID: 'c', guildID: 'g', secretKey: '' }) })
        .toThrow(/WORDSMITH_SECRET_KEY/)
    })

    it('should list every missing required value', async () => {
      const { assertConfig } = await import('../../src/core/settings')
      expect(() => { assertConfig({ clientID: '', guildID: '', secretKey: '' }) })
        .toThrow(/WORDSMITH_SECRET_KEY.*WORDSMITH_CLIENT_ID.*WORDSMITH_GUILD_ID/)
    })

    it('should not throw when all required values are present', async () => {
      const { assertConfig } = await import('../../src/core/settings')
      expect(() => { assertConfig({ clientID: 'c', guildID: 'g', secretKey: 's' }) })
        .not.toThrow()
    })
  })
})
