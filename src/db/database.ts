import { Capacitor } from '@capacitor/core'

export const DEFAULT_USER_ID = 'default-user'
export const IS_NATIVE = Capacitor.isNativePlatform()

export function generateId(): string {
  return crypto.randomUUID()
}

// SQLite connection (only used on native)
let _sqliteDb: import('@capacitor-community/sqlite').SQLiteDBConnection | null = null
let _initPromise: Promise<import('@capacitor-community/sqlite').SQLiteDBConnection> | null = null

export async function getSqliteDb() {
  if (_sqliteDb) return _sqliteDb

  // Prevent concurrent initialization - all callers wait on the same promise
  if (_initPromise) return _initPromise

  _initPromise = _initSqlite()
  try {
    _sqliteDb = await _initPromise
    return _sqliteDb
  } catch (e) {
    _initPromise = null
    throw e
  }
}

async function _initSqlite() {
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')
  const { SCHEMA_SQL } = await import('./schema.sql')

  const sqlite = new SQLiteConnection(CapacitorSQLite)

  let db: import('@capacitor-community/sqlite').SQLiteDBConnection

  try {
    const ret = await sqlite.checkConnectionsConsistency()
    const isConn = (await sqlite.isConnection('info_app', false)).result

    if (ret.result && isConn) {
      db = await sqlite.retrieveConnection('info_app', false)
    } else {
      db = await sqlite.createConnection('info_app', false, 'no-encryption', 1, false)
    }
  } catch {
    // If createConnection fails (e.g. "already exists"), try to retrieve it
    try {
      db = await sqlite.retrieveConnection('info_app', false)
    } catch {
      // Last resort: close all and recreate
      await sqlite.closeAllConnections()
      db = await sqlite.createConnection('info_app', false, 'no-encryption', 1, false)
    }
  }

  await db.open()
  await db.execute(SCHEMA_SQL)

  // Seed default user
  const res = await db.query("SELECT id FROM users LIMIT 1")
  if (!res.values || res.values.length === 0) {
    const now = new Date().toISOString()
    await db.run(
      "INSERT INTO users (id, username, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      ['default-user', 'admin', 'Admin', now, now]
    )
    await db.run(
      "INSERT INTO profiles (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
      ['default-profile', 'default-user', now, now]
    )
    await db.run(
      "INSERT INTO works (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
      ['default-work', 'default-user', now, now]
    )
  }

  return db
}
