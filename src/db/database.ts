import { Capacitor } from '@capacitor/core'

export const DEFAULT_USER_ID = 'default-user'
export const IS_NATIVE = Capacitor.isNativePlatform()

export function generateId(): string {
  return crypto.randomUUID()
}

// SQLite connection (only used on native)
let _sqliteDb: import('@capacitor-community/sqlite').SQLiteDBConnection | null = null

export async function getSqliteDb() {
  if (_sqliteDb) return _sqliteDb

  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')
  const { SCHEMA_SQL } = await import('./schema.sql')

  const sqlite = new SQLiteConnection(CapacitorSQLite)

  const ret = await sqlite.checkConnectionsConsistency()
  const isConn = (await sqlite.isConnection('info_app', false)).result

  if (ret.result && isConn) {
    _sqliteDb = await sqlite.retrieveConnection('info_app', false)
  } else {
    _sqliteDb = await sqlite.createConnection('info_app', false, 'no-encryption', 1, false)
  }

  await _sqliteDb.open()
  await _sqliteDb.execute(SCHEMA_SQL)

  // Seed default user
  const res = await _sqliteDb.query("SELECT id FROM users LIMIT 1")
  if (!res.values || res.values.length === 0) {
    const now = new Date().toISOString()
    await _sqliteDb.run(
      "INSERT INTO users (id, username, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      ['default-user', 'admin', 'Admin', now, now]
    )
    await _sqliteDb.run(
      "INSERT INTO profiles (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
      ['default-profile', 'default-user', now, now]
    )
    await _sqliteDb.run(
      "INSERT INTO works (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
      ['default-work', 'default-user', now, now]
    )
  }

  return _sqliteDb
}
