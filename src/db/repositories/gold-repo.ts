import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb, generateId } from '../database'
import { webDb } from '../web-storage'
import type { GoldHolding } from '@/types'

function rowToHolding(r: Record<string, unknown>): GoldHolding {
  return {
    id: r.id as string,
    goldType: (r.gold_type ?? r.goldType) as string,
    goldTypeName: (r.gold_type_name ?? r.goldTypeName) as string,
    quantity: r.quantity as number,
    buyPrice: (r.buy_price ?? r.buyPrice) as number,
    createdAt: (r.created_at ?? r.createdAt ?? '') as string,
  }
}

export const goldRepo = {
  async getAll(): Promise<GoldHolding[]> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        "SELECT * FROM gold_holdings WHERE user_id = ? ORDER BY created_at DESC",
        [DEFAULT_USER_ID]
      )
      return (res.values || []).map(rowToHolding)
    }
    const rows = webDb.query('gold_holdings', (r) => r.user_id === DEFAULT_USER_ID)
    return rows.map(rowToHolding).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async create(data: { goldType: string; goldTypeName: string; quantity: number; buyPrice: number }): Promise<GoldHolding> {
    const id = generateId()
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        "INSERT INTO gold_holdings (id, user_id, gold_type, gold_type_name, quantity, buy_price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, DEFAULT_USER_ID, data.goldType, data.goldTypeName, data.quantity, data.buyPrice, now]
      )
    } else {
      webDb.insert('gold_holdings', {
        id, user_id: DEFAULT_USER_ID,
        gold_type: data.goldType, goldType: data.goldType,
        gold_type_name: data.goldTypeName, goldTypeName: data.goldTypeName,
        quantity: data.quantity,
        buy_price: data.buyPrice, buyPrice: data.buyPrice,
        created_at: now, createdAt: now,
      })
    }
    return { id, goldType: data.goldType, goldTypeName: data.goldTypeName, quantity: data.quantity, buyPrice: data.buyPrice, createdAt: now }
  },

  async update(id: string, data: Partial<{ quantity: number; buyPrice: number }>): Promise<GoldHolding | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const sets: string[] = []
      const vals: unknown[] = []
      if (data.quantity !== undefined) { sets.push("quantity = ?"); vals.push(data.quantity) }
      if (data.buyPrice !== undefined) { sets.push("buy_price = ?"); vals.push(data.buyPrice) }
      if (sets.length === 0) return null
      vals.push(id); vals.push(DEFAULT_USER_ID)
      await db.run(`UPDATE gold_holdings SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`, vals as string[])
      const res = await db.query("SELECT * FROM gold_holdings WHERE id = ?", [id])
      if (!res.values || res.values.length === 0) return null
      return rowToHolding(res.values[0])
    } else {
      const mapped: Record<string, unknown> = {}
      if (data.quantity !== undefined) mapped.quantity = data.quantity
      if (data.buyPrice !== undefined) { mapped.buy_price = data.buyPrice; mapped.buyPrice = data.buyPrice }
      webDb.update('gold_holdings', id, mapped)
      const rows = webDb.query('gold_holdings', (r) => r.id === id)
      if (rows.length === 0) return null
      return rowToHolding(rows[0])
    }
  },

  async delete(id: string): Promise<void> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run("DELETE FROM gold_holdings WHERE id = ? AND user_id = ?", [id, DEFAULT_USER_ID])
    } else {
      webDb.delete('gold_holdings', id)
    }
  },
}
