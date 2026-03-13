import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb, generateId } from '../database'
import { webDb } from '../web-storage'
import type { CalendarEvent } from '@/types'

function rowToEvent(r: Record<string, unknown>): CalendarEvent {
  return {
    id: r.id as string,
    title: r.title as string,
    description: (r.description ?? null) as string | null,
    start: (r.start_date ?? r.start ?? '') as string,
    end: (r.end_date ?? r.end ?? null) as string | null,
    allDay: r.all_day === 1 || r.allDay === true,
    location: (r.location ?? null) as string | null,
    color: ((r.color as string) || '#3B82F6'),
    reminderAt: (r.reminder_at ?? r.reminderAt ?? null) as string | null,
    isRepeating: r.is_repeating === 1 || r.isRepeating === true,
    rrule: (r.repeat_rule ?? r.rrule ?? undefined) as string | undefined,
  }
}

export const eventRepo = {
  async getByDateRange(start: string, end: string): Promise<CalendarEvent[]> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        `SELECT * FROM events WHERE user_id = ? AND is_archived = 0
         AND start_date >= ? AND start_date <= ? ORDER BY start_date ASC`,
        [DEFAULT_USER_ID, start, end]
      )
      return (res.values || []).map(rowToEvent)
    }
    return webDb.query('events', (r) =>
      r.user_id === DEFAULT_USER_ID && !r.is_archived &&
      (r.start_date as string || r.start as string) >= start &&
      (r.start_date as string || r.start as string) <= end
    ).map(rowToEvent).sort((a, b) => a.start.localeCompare(b.start))
  },

  async getById(id: string): Promise<CalendarEvent | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query("SELECT * FROM events WHERE id = ? AND user_id = ?", [id, DEFAULT_USER_ID])
      if (!res.values || res.values.length === 0) return null
      return rowToEvent(res.values[0])
    }
    const rows = webDb.query('events', (r) => r.id === id)
    if (rows.length === 0) return null
    return rowToEvent(rows[0])
  },

  async create(data: {
    title: string; description?: string; start: string; end?: string | null;
    allDay: boolean; location?: string; color?: string; reminderAt?: string | null;
    isRepeating?: boolean; repeatRule?: string | null;
  }): Promise<CalendarEvent> {
    const id = generateId()
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        `INSERT INTO events (id, user_id, title, description, start_date, end_date, all_day, location, color, reminder_at, is_repeating, repeat_rule, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, DEFAULT_USER_ID, data.title, data.description || null, data.start, data.end || null,
         data.allDay ? 1 : 0, data.location || null, data.color || '#3B82F6',
         data.reminderAt || null, data.isRepeating ? 1 : 0, data.repeatRule || null, now, now]
      )
    } else {
      webDb.insert('events', {
        id, user_id: DEFAULT_USER_ID, title: data.title, description: data.description || null,
        start_date: data.start, start: data.start, end_date: data.end || null, end: data.end || null,
        allDay: data.allDay, all_day: data.allDay ? 1 : 0,
        location: data.location || null, color: data.color || '#3B82F6',
        reminderAt: data.reminderAt || null, reminder_at: data.reminderAt || null,
        isRepeating: data.isRepeating || false, is_repeating: data.isRepeating ? 1 : 0,
        rrule: data.repeatRule || null, repeat_rule: data.repeatRule || null,
        is_archived: false, created_at: now, updated_at: now,
      })
    }
    return (await this.getById(id))!
  },

  async update(id: string, data: Record<string, unknown>): Promise<CalendarEvent | null> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const sets: string[] = []
      const vals: unknown[] = []
      if (data.title !== undefined) { sets.push("title = ?"); vals.push(data.title) }
      if (data.description !== undefined) { sets.push("description = ?"); vals.push(data.description) }
      if (data.start !== undefined) { sets.push("start_date = ?"); vals.push(data.start) }
      if (data.end !== undefined) { sets.push("end_date = ?"); vals.push(data.end) }
      if (data.allDay !== undefined) { sets.push("all_day = ?"); vals.push(data.allDay ? 1 : 0) }
      if (data.location !== undefined) { sets.push("location = ?"); vals.push(data.location) }
      if (data.color !== undefined) { sets.push("color = ?"); vals.push(data.color) }
      if (data.reminderAt !== undefined) { sets.push("reminder_at = ?"); vals.push(data.reminderAt) }
      if (data.isRepeating !== undefined) { sets.push("is_repeating = ?"); vals.push(data.isRepeating ? 1 : 0) }
      if (data.repeatRule !== undefined) { sets.push("repeat_rule = ?"); vals.push(data.repeatRule) }
      sets.push("updated_at = ?"); vals.push(now)
      vals.push(id); vals.push(DEFAULT_USER_ID)
      await db.run(`UPDATE events SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`, vals as string[])
    } else {
      const mapped: Record<string, unknown> = { ...data, updated_at: now }
      if (data.start !== undefined) { mapped.start_date = data.start }
      if (data.end !== undefined) { mapped.end_date = data.end }
      webDb.update('events', id, mapped)
    }
    return this.getById(id)
  },

  async delete(id: string): Promise<void> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run("UPDATE events SET is_archived = 1, updated_at = ? WHERE id = ? AND user_id = ?", [now, id, DEFAULT_USER_ID])
    } else {
      webDb.update('events', id, { is_archived: true, updated_at: now })
    }
  },
}
