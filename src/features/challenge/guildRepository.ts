import { getDb } from '../../core/db'

export function getGm (guildId: string): string | null {
  const row = getDb()
    .prepare('SELECT gm_user_id FROM guild_settings WHERE guild_id = ?')
    .get(guildId) as { gm_user_id: string | null } | undefined
  return row?.gm_user_id ?? null
}

export function setGm (guildId: string, gmUserId: string): void {
  getDb()
    .prepare(`
      INSERT INTO guild_settings (guild_id, gm_user_id) VALUES (?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET gm_user_id = excluded.gm_user_id
    `)
    .run(guildId, gmUserId)
}

export function isGm (guildId: string, userId: string): boolean {
  return getGm(guildId) === userId
}
