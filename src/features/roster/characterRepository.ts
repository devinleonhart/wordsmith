import { getDb } from '../../core/db'

export interface Character {
  id: number
  userId: string
  name: string
  star: boolean
}

interface CharacterRow {
  id: number
  user_id: string
  name: string
  star: number
}

function toCharacter (row: CharacterRow): Character {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    star: row.star === 1
  }
}

export function createCharacter (userId: string, name: string, star: boolean): Character {
  const db = getDb()
  const result = db
    .prepare('INSERT INTO characters (user_id, name, star) VALUES (?, ?, ?)')
    .run(userId, name, star ? 1 : 0)
  return { id: result.lastInsertRowid as number, userId, name, star }
}

export function getCharacters (userId: string): Character[] {
  const rows = getDb()
    .prepare('SELECT * FROM characters WHERE user_id = ? ORDER BY id ASC')
    .all(userId) as CharacterRow[]
  return rows.map(toCharacter)
}

export function getCharacterById (id: number): Character | null {
  const row = getDb()
    .prepare('SELECT * FROM characters WHERE id = ?')
    .get(id) as CharacterRow | undefined
  return row ? toCharacter(row) : null
}

export function getActiveCharacter (userId: string): Character | null {
  const row = getDb()
    .prepare(`
      SELECT c.* FROM characters c
      JOIN user_settings us ON us.active_character_id = c.id
      WHERE us.user_id = ?
    `)
    .get(userId) as CharacterRow | undefined
  return row ? toCharacter(row) : null
}

export function setActiveCharacter (userId: string, characterId: number): void {
  getDb()
    .prepare(`
      INSERT INTO user_settings (user_id, active_character_id) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET active_character_id = excluded.active_character_id
    `)
    .run(userId, characterId)
}

export function deleteCharacter (userId: string, name: string): boolean {
  const result = getDb()
    .prepare('DELETE FROM characters WHERE user_id = ? AND name = ?')
    .run(userId, name)
  return result.changes > 0
}

export function addWord (characterId: number, word: string): void {
  getDb()
    .prepare('INSERT INTO words (character_id, word) VALUES (?, ?)')
    .run(characterId, word)
}

export function deleteWord (characterId: number, word: string): boolean {
  const result = getDb()
    .prepare('DELETE FROM words WHERE character_id = ? AND word = ?')
    .run(characterId, word)
  return result.changes > 0
}

export function getWords (characterId: number): string[] {
  const rows = getDb()
    .prepare('SELECT word FROM words WHERE character_id = ? ORDER BY id ASC')
    .all(characterId) as Array<{ word: string }>
  return rows.map(r => r.word)
}

export function setStar (characterId: number, star: boolean): void {
  getDb()
    .prepare('UPDATE characters SET star = ? WHERE id = ?')
    .run(star ? 1 : 0, characterId)
}

export function addItem (characterId: number, item: string): void {
  getDb()
    .prepare('INSERT INTO items (character_id, item) VALUES (?, ?)')
    .run(characterId, item)
}

export function deleteItem (characterId: number, item: string): boolean {
  const result = getDb()
    .prepare('DELETE FROM items WHERE character_id = ? AND item = ?')
    .run(characterId, item)
  return result.changes > 0
}

export function getItems (characterId: number): string[] {
  const rows = getDb()
    .prepare('SELECT item FROM items WHERE character_id = ? ORDER BY id ASC')
    .all(characterId) as Array<{ item: string }>
  return rows.map(r => r.item)
}
