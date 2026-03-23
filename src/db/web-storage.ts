// Simple localStorage-based storage for web/browser testing
// On Android, the real SQLite database is used instead

const STORAGE_KEY = 'info_app_db'

interface DbStore {
  users: Record<string, unknown>[]
  profiles: Record<string, unknown>[]
  works: Record<string, unknown>[]
  events: Record<string, unknown>[]
  notes: Record<string, unknown>[]
  budgets: Record<string, unknown>[]
  expenses: Record<string, unknown>[]
  gold_holdings: Record<string, unknown>[]
  health_logs: Record<string, unknown>[]
  health_photos: Record<string, unknown>[]
}

function getStore(): DbStore {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    const parsed = JSON.parse(raw)
    // Ensure new tables exist in old stores
    if (!parsed.gold_holdings) parsed.gold_holdings = []
    if (!parsed.health_logs) parsed.health_logs = []
    if (!parsed.health_photos) parsed.health_photos = []
    return parsed
  }
  // Seed default data
  const now = new Date().toISOString()
  const store: DbStore = {
    users: [{ id: 'default-user', username: 'admin', name: 'Admin', created_at: now, updated_at: now }],
    profiles: [{ id: 'default-profile', user_id: 'default-user', created_at: now, updated_at: now }],
    works: [{ id: 'default-work', user_id: 'default-user', created_at: now, updated_at: now }],
    events: [],
    notes: [],
    budgets: [],
    expenses: [],
    gold_holdings: [],
    health_logs: [],
    health_photos: [],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  return store
}

function saveStore(store: DbStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export const webDb = {
  query(table: keyof DbStore, filter?: (row: Record<string, unknown>) => boolean): Record<string, unknown>[] {
    const store = getStore()
    const rows = store[table] || []
    return filter ? rows.filter(filter) : rows
  },

  insert(table: keyof DbStore, row: Record<string, unknown>) {
    const store = getStore()
    store[table].push(row)
    saveStore(store)
  },

  update(table: keyof DbStore, id: string, data: Record<string, unknown>) {
    const store = getStore()
    const idx = store[table].findIndex((r) => r.id === id)
    if (idx >= 0) {
      store[table][idx] = { ...store[table][idx], ...data }
      saveStore(store)
    }
  },

  updateWhere(table: keyof DbStore, filter: (row: Record<string, unknown>) => boolean, data: Record<string, unknown>) {
    const store = getStore()
    const idx = store[table].findIndex(filter)
    if (idx >= 0) {
      store[table][idx] = { ...store[table][idx], ...data }
      saveStore(store)
    }
  },

  delete(table: keyof DbStore, id: string) {
    const store = getStore()
    store[table] = store[table].filter((r) => r.id !== id)
    saveStore(store)
  },
}
