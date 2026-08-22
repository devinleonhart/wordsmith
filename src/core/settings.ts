import { config } from 'dotenv'

if (process.env.NODE_ENV === 'development') {
  config()
}

interface Settings {
  clientID: string
  guildID: string
  secretKey: string
}

const settings: Settings = {
  clientID: process.env.WORDSMITH_CLIENT_ID ?? '707732906466082843',
  guildID: process.env.WORDSMITH_GUILD_ID ?? '203642332531261441',
  secretKey: process.env.WORDSMITH_SECRET_KEY ?? ''
}

// Fail fast at startup with a clear message rather than a cryptic login error.
// In the default config only secretKey can be missing (clientID/guildID fall
// back to non-empty defaults); the clientID/guildID checks guard callers that
// pass an explicit config object. Not run at import time so settings stays
// importable in tests.
export function assertConfig (s: Settings = settings): void {
  const missing: string[] = []
  if (!s.secretKey) missing.push('WORDSMITH_SECRET_KEY')
  if (!s.clientID) missing.push('WORDSMITH_CLIENT_ID')
  if (!s.guildID) missing.push('WORDSMITH_GUILD_ID')
  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.join(', ')}. ` +
      'Set these environment variables (see .env.example).'
    )
  }
}

export default settings
