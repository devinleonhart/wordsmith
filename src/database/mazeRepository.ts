import { getDb } from './db'

export function getState (guildId: string): { x: number; y: number } | null {
  const row = getDb()
    .prepare('SELECT x, y FROM maze_state WHERE guild_id = ?')
    .get(guildId) as { x: number; y: number } | undefined
  return row ?? null
}

export function setState (guildId: string, x: number, y: number): void {
  getDb()
    .prepare(`
      INSERT INTO maze_state (guild_id, x, y) VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET x = excluded.x, y = excluded.y
    `)
    .run(guildId, x, y)
}

export function getVisited (guildId: string): Set<string> {
  const rows = getDb()
    .prepare('SELECT x, y FROM maze_visited WHERE guild_id = ?')
    .all(guildId) as Array<{ x: number; y: number }>
  return new Set(rows.map(r => `${r.x},${r.y}`))
}

export function addVisited (guildId: string, x: number, y: number): void {
  getDb()
    .prepare(`
      INSERT OR IGNORE INTO maze_visited (guild_id, x, y) VALUES (?, ?, ?)
    `)
    .run(guildId, x, y)
}

export function initMaze (guildId: string, x: number, y: number): void {
  setState(guildId, x, y)
  addVisited(guildId, x, y)
}

export function resetMaze (guildId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM maze_visited WHERE guild_id = ?').run(guildId)
  db.prepare('DELETE FROM maze_state WHERE guild_id = ?').run(guildId)
}
