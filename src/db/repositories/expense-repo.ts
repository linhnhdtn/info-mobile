import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb, generateId } from '../database'
import { webDb } from '../web-storage'
import type { Expense } from '@/types'

function rowToExpense(r: Record<string, unknown>): Expense {
  return {
    id: r.id as string,
    amount: r.amount as number,
    description: (r.description ?? null) as string | null,
    category: r.category as string,
    date: r.date as string,
    createdAt: (r.created_at ?? r.createdAt ?? '') as string,
    updatedAt: (r.updated_at ?? r.updatedAt ?? '') as string,
  }
}

function monthRange(monthKey: number) {
  const year = Math.floor(monthKey / 100)
  const month = monthKey % 100
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`
  return { startDate, endDate }
}

export const expenseRepo = {
  async getByMonth(monthKey: number): Promise<Expense[]> {
    const { startDate, endDate } = monthRange(monthKey)
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        "SELECT * FROM expenses WHERE user_id = ? AND date >= ? AND date < ? ORDER BY date DESC, created_at DESC",
        [DEFAULT_USER_ID, startDate, endDate])
      return (res.values || []).map(rowToExpense)
    }
    const rows = webDb.query('expenses', (r) =>
      r.user_id === DEFAULT_USER_ID &&
      (r.date as string) >= startDate &&
      (r.date as string) < endDate
    )
    return rows.map(rowToExpense).sort((a, b) => b.date.localeCompare(a.date))
  },

  async create(data: { amount: number; description?: string; category: string; date: string }): Promise<Expense> {
    const id = generateId()
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        "INSERT INTO expenses (id, user_id, amount, description, category, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, DEFAULT_USER_ID, data.amount, data.description || null, data.category, data.date, now, now])
    } else {
      webDb.insert('expenses', {
        id, user_id: DEFAULT_USER_ID, amount: data.amount,
        description: data.description || null, category: data.category, date: data.date,
        created_at: now, updated_at: now, createdAt: now, updatedAt: now,
      })
    }
    return { id, amount: data.amount, description: data.description || null, category: data.category, date: data.date, createdAt: now, updatedAt: now }
  },

  async update(id: string, data: Partial<{ amount: number; description: string }>): Promise<Expense | null> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const sets: string[] = []
      const vals: unknown[] = []
      if (data.amount !== undefined) { sets.push("amount = ?"); vals.push(data.amount) }
      if (data.description !== undefined) { sets.push("description = ?"); vals.push(data.description) }
      sets.push("updated_at = ?"); vals.push(now)
      vals.push(id); vals.push(DEFAULT_USER_ID)
      await db.run(`UPDATE expenses SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`, vals as string[])
      const res = await db.query("SELECT * FROM expenses WHERE id = ?", [id])
      if (!res.values || res.values.length === 0) return null
      return rowToExpense(res.values[0])
    } else {
      const mapped: Record<string, unknown> = { updated_at: now, updatedAt: now }
      if (data.amount !== undefined) mapped.amount = data.amount
      if (data.description !== undefined) mapped.description = data.description
      webDb.update('expenses', id, mapped)
      const rows = webDb.query('expenses', (r) => r.id === id)
      if (rows.length === 0) return null
      return rowToExpense(rows[0])
    }
  },

  async delete(id: string): Promise<void> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run("DELETE FROM expenses WHERE id = ? AND user_id = ?", [id, DEFAULT_USER_ID])
    } else {
      webDb.delete('expenses', id)
    }
  },

  async getYearlySummary(year: number) {
    const months = []
    for (let m = 1; m <= 12; m++) {
      const monthKey = year * 100 + m
      const expenses = await this.getByMonth(monthKey)
      const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)

      // Get budget for this month
      const { budgetRepo } = await import('./budget-repo')
      const budget = await budgetRepo.getByMonth(monthKey)
      const totalBudget = budget ? budget.totalBudget : null

      months.push({ month: monthKey, totalBudget, totalSpent })
    }
    return { year, months }
  },
}
