import { randomUUID } from 'node:crypto'
import { getDb } from '../../core/db'
import { type ChallengeResult } from '../dice/engine'

export type SessionStatus = 'proposing' | 'awaiting_gm' | 'approved' | 'resolved'

export interface SessionTag {
  name: string
  kind: 'word' | 'item'
  on: boolean
}

export interface RollSession {
  id: string
  guildId: string
  channelId: string
  messageId: string | null
  playerId: string
  characterId: number | null
  idea: string
  challengeDice: number
  creativityDice: number
  tags: SessionTag[]
  status: SessionStatus
  result: ChallengeResult | null
  createdAt: number
}

interface SessionRow {
  id: string
  guild_id: string
  channel_id: string
  message_id: string | null
  player_id: string
  character_id: number | null
  idea: string
  challenge_dice: number
  creativity_dice: number
  tags_json: string
  status: string
  result_json: string | null
  created_at: number
}

function toSession (row: SessionRow): RollSession {
  return {
    id: row.id,
    guildId: row.guild_id,
    channelId: row.channel_id,
    messageId: row.message_id,
    playerId: row.player_id,
    characterId: row.character_id,
    idea: row.idea,
    challengeDice: row.challenge_dice,
    creativityDice: row.creativity_dice,
    tags: JSON.parse(row.tags_json) as SessionTag[],
    status: row.status as SessionStatus,
    result: row.result_json ? (JSON.parse(row.result_json) as ChallengeResult) : null,
    createdAt: row.created_at
  }
}

export interface CreateSessionInput {
  guildId: string
  channelId: string
  playerId: string
  characterId: number | null
  idea: string
  tags: SessionTag[]
}

export function createSession (input: CreateSessionInput): RollSession {
  const id = randomUUID()
  const createdAt = Date.now()
  getDb()
    .prepare(`
      INSERT INTO roll_sessions
        (id, guild_id, channel_id, player_id, character_id, idea, tags_json, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'proposing', ?)
    `)
    .run(
      id, input.guildId, input.channelId, input.playerId, input.characterId,
      input.idea, JSON.stringify(input.tags), createdAt
    )
  return getSession(id) as RollSession
}

export function getSession (id: string): RollSession | null {
  const row = getDb()
    .prepare('SELECT * FROM roll_sessions WHERE id = ?')
    .get(id) as SessionRow | undefined
  return row ? toSession(row) : null
}

export function updateSession (
  id: string,
  patch: Partial<Pick<RollSession,
    'messageId' | 'idea' | 'challengeDice' | 'creativityDice' | 'tags' | 'status' | 'result'
  >>
): void {
  const sets: string[] = []
  const values: unknown[] = []
  if (patch.messageId !== undefined) { sets.push('message_id = ?'); values.push(patch.messageId) }
  if (patch.idea !== undefined) { sets.push('idea = ?'); values.push(patch.idea) }
  if (patch.challengeDice !== undefined) { sets.push('challenge_dice = ?'); values.push(patch.challengeDice) }
  if (patch.creativityDice !== undefined) { sets.push('creativity_dice = ?'); values.push(patch.creativityDice) }
  if (patch.tags !== undefined) { sets.push('tags_json = ?'); values.push(JSON.stringify(patch.tags)) }
  if (patch.status !== undefined) { sets.push('status = ?'); values.push(patch.status) }
  if (patch.result !== undefined) { sets.push('result_json = ?'); values.push(patch.result ? JSON.stringify(patch.result) : null) }
  if (sets.length === 0) return
  values.push(id)
  getDb().prepare(`UPDATE roll_sessions SET ${sets.join(', ')} WHERE id = ?`).run(...values)
}

export function deleteSession (id: string): void {
  getDb().prepare('DELETE FROM roll_sessions WHERE id = ?').run(id)
}

// Player pool = base 3 + invoked (on) tags + GM creativity dice.
export const BASE_PLAYER_DICE = 3
export function playerPool (session: RollSession): number {
  const invoked = session.tags.filter(t => t.on).length
  return BASE_PLAYER_DICE + invoked + session.creativityDice
}
