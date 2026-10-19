import { DatabaseSync } from 'node:sqlite'

let db: DatabaseSync | undefined

export function initDb (path: string = process.env.DATABASE_PATH ?? './data/wordsmith.db'): void {
  db = new DatabaseSync(path)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  migrate(db)
}

export function getDb (): DatabaseSync {
  if (!db) throw new Error('Database not initialized. Call initDb() first.')
  return db
}

export function closeDb (): void {
  if (db?.isOpen) db.close()
}

function migrate (database: DatabaseSync): void {
  const { user_version: version } = database.prepare('PRAGMA user_version').get() as { user_version: number }

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
    const cols = database.prepare('PRAGMA table_info(characters)').all() as Array<{ name: string }>
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

    database.exec('PRAGMA user_version = 1')
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

    database.exec('PRAGMA user_version = 2')
  }

  if (version < 3) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS maze_state (
        guild_id TEXT PRIMARY KEY,
        x        INTEGER NOT NULL,
        y        INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS maze_visited (
        guild_id TEXT    NOT NULL,
        x        INTEGER NOT NULL,
        y        INTEGER NOT NULL,
        PRIMARY KEY (guild_id, x, y)
      );

      CREATE TABLE IF NOT EXISTS maze_collected_gems (
        guild_id TEXT    NOT NULL,
        x        INTEGER NOT NULL,
        y        INTEGER NOT NULL,
        PRIMARY KEY (guild_id, x, y)
      );
    `)

    database.exec('PRAGMA user_version = 3')
  }

  if (version < 4) {
    // The maze feature has been removed; drop its tables.
    database.exec(`
      DROP TABLE IF EXISTS maze_collected_gems;
      DROP TABLE IF EXISTS maze_visited;
      DROP TABLE IF EXISTS maze_state;
    `)

    database.exec('PRAGMA user_version = 4')
  }
}
