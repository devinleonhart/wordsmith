import Database from 'better-sqlite3'

let db: Database.Database

export function initDb (path: string = process.env.DATABASE_PATH ?? './data/wordsmith.db'): void {
  db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
}

export function getDb (): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.')
  return db
}

function migrate (database: Database.Database): void {
  const version = database.pragma('user_version', { simple: true }) as number

  if (version < 1) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT    NOT NULL,
        name    TEXT    NOT NULL,
        star    INTEGER NOT NULL DEFAULT 0,
        UNIQUE(user_id, name)
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id             TEXT PRIMARY KEY,
        active_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL
      );
    `)

    // Rename has_star → star on databases created before versioning was introduced
    const cols = database.pragma('table_info(characters)') as Array<{ name: string }>
    if (cols.some(c => c.name === 'has_star')) {
      database.exec('ALTER TABLE characters RENAME COLUMN has_star TO star')
    }

    database.exec(`
      CREATE TABLE IF NOT EXISTS words (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        word         TEXT    NOT NULL,
        UNIQUE(character_id, word)
      );
    `)

    database.pragma('user_version = 1')
  }

  if (version < 2) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        item         TEXT    NOT NULL,
        UNIQUE(character_id, item)
      );
    `)

    database.pragma('user_version = 2')
  }
}
