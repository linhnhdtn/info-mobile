import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb } from '../database'
import { webDb } from '../web-storage'
import type { WorkInfo } from '@/types'

function rowToWork(r: Record<string, unknown>): WorkInfo {
  return {
    id: r.id as string,
    company: (r.company ?? null) as string | null,
    position: (r.position ?? null) as string | null,
    department: (r.department ?? null) as string | null,
    employeeId: (r.employee_id ?? r.employeeId ?? null) as string | null,
    workEmail: (r.work_email ?? r.workEmail ?? null) as string | null,
    workPhone: (r.work_phone ?? r.workPhone ?? null) as string | null,
    workAddress: (r.work_address ?? r.workAddress ?? null) as string | null,
    startDate: (r.start_date ?? r.startDate ?? null) as string | null,
    endDate: (r.end_date ?? r.endDate ?? null) as string | null,
    salary: (r.salary ?? null) as string | null,
    notes: (r.notes ?? null) as string | null,
  }
}

export const workRepo = {
  async get(): Promise<WorkInfo | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query("SELECT * FROM works WHERE user_id = ?", [DEFAULT_USER_ID])
      if (!res.values || res.values.length === 0) return null
      return rowToWork(res.values[0])
    }
    const rows = webDb.query('works', (r) => r.user_id === DEFAULT_USER_ID)
    if (rows.length === 0) return null
    return rowToWork(rows[0])
  },

  async update(data: Partial<WorkInfo>): Promise<WorkInfo | null> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        `UPDATE works SET
          company = COALESCE(?, company), position = COALESCE(?, position),
          department = COALESCE(?, department), employee_id = COALESCE(?, employee_id),
          work_email = COALESCE(?, work_email), work_phone = COALESCE(?, work_phone),
          work_address = COALESCE(?, work_address), start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date), salary = COALESCE(?, salary),
          notes = COALESCE(?, notes), updated_at = ?
        WHERE user_id = ?`,
        [data.company ?? null, data.position ?? null, data.department ?? null,
         data.employeeId ?? null, data.workEmail ?? null, data.workPhone ?? null,
         data.workAddress ?? null, data.startDate ?? null, data.endDate ?? null,
         data.salary ?? null, data.notes ?? null, now, DEFAULT_USER_ID]
      )
    } else {
      const mapped: Record<string, unknown> = { updated_at: now }
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) mapped[k] = v
      }
      webDb.updateWhere('works', (r) => r.user_id === DEFAULT_USER_ID, mapped)
    }
    return this.get()
  },
}
