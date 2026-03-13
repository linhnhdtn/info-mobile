import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb, generateId } from '../database'
import { webDb } from '../web-storage'
import type { Budget } from '@/types'

function rowToBudget(r: Record<string, unknown>): Budget {
  const da = r.daily_allowances ?? r.dailyAllowances
  return {
    id: r.id as string,
    month: r.month as number,
    totalBudget: (r.total_budget ?? r.totalBudget) as number,
    dailyAllowances: typeof da === 'string' ? JSON.parse(da) : (da as number[]),
    createdAt: (r.created_at ?? r.createdAt ?? '') as string,
    updatedAt: (r.updated_at ?? r.updatedAt ?? '') as string,
  }
}

export const budgetRepo = {
  async getByMonth(month: number): Promise<Budget | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query("SELECT * FROM budgets WHERE user_id = ? AND month = ?", [DEFAULT_USER_ID, month])
      if (!res.values || res.values.length === 0) return null
      return rowToBudget(res.values[0])
    }
    const rows = webDb.query('budgets', (r) => r.user_id === DEFAULT_USER_ID && r.month === month)
    if (rows.length === 0) return null
    return rowToBudget(rows[0])
  },

  async upsert(data: { month: number; totalBudget: number; dailyAllowances: number[] }): Promise<Budget> {
    const now = new Date().toISOString()
    const existing = await this.getByMonth(data.month)

    if (existing) {
      if (IS_NATIVE) {
        const db = await getSqliteDb()
        await db.run("UPDATE budgets SET total_budget = ?, daily_allowances = ?, updated_at = ? WHERE id = ?",
          [data.totalBudget, JSON.stringify(data.dailyAllowances), now, existing.id])
      } else {
        webDb.update('budgets', existing.id, {
          totalBudget: data.totalBudget, total_budget: data.totalBudget,
          dailyAllowances: data.dailyAllowances, daily_allowances: JSON.stringify(data.dailyAllowances),
          updated_at: now, updatedAt: now,
        })
      }
      return (await this.getByMonth(data.month))!
    }

    const id = generateId()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        "INSERT INTO budgets (id, user_id, month, total_budget, daily_allowances, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, DEFAULT_USER_ID, data.month, data.totalBudget, JSON.stringify(data.dailyAllowances), now, now])
    } else {
      webDb.insert('budgets', {
        id, user_id: DEFAULT_USER_ID, month: data.month,
        totalBudget: data.totalBudget, total_budget: data.totalBudget,
        dailyAllowances: data.dailyAllowances, daily_allowances: JSON.stringify(data.dailyAllowances),
        created_at: now, updated_at: now, createdAt: now, updatedAt: now,
      })
    }
    return (await this.getByMonth(data.month))!
  },
}
