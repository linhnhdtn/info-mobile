import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb, generateId } from '../database'
import { webDb } from '../web-storage'
import type { Note } from '@/types'

function rowToNote(r: Record<string, unknown>): Note {
  const tags = r.tags
  return {
    id: r.id as string,
    title: (r.title ?? null) as string | null,
    content: r.content as string,
    color: ((r.color as string) || '#FFFFFF'),
    isPinned: r.is_pinned === 1 || r.isPinned === true,
    tags: typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : []),
    createdAt: (r.created_at ?? r.createdAt ?? '') as string,
    updatedAt: (r.updated_at ?? r.updatedAt ?? '') as string,
  }
}

export const noteRepo = {
  async getAll(search?: string, tag?: string): Promise<Note[]> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      let sql = "SELECT * FROM notes WHERE user_id = ? AND is_archived = 0"
      const params: string[] = [DEFAULT_USER_ID]
      if (search) { sql += " AND (title LIKE ? OR content LIKE ?)"; params.push(`%${search}%`, `%${search}%`) }
      if (tag) { sql += " AND tags LIKE ?"; params.push(`%"${tag}"%`) }
      sql += " ORDER BY is_pinned DESC, updated_at DESC"
      const res = await db.query(sql, params)
      return (res.values || []).map(rowToNote)
    }
    let rows = webDb.query('notes', (r) => r.user_id === DEFAULT_USER_ID && !r.is_archived && r.isArchived !== true)
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter((r) =>
        (r.title as string || '').toLowerCase().includes(s) ||
        (r.content as string || '').toLowerCase().includes(s)
      )
    }
    if (tag) {
      rows = rows.filter((r) => {
        const tags = Array.isArray(r.tags) ? r.tags : JSON.parse((r.tags as string) || '[]')
        return tags.includes(tag)
      })
    }
    const notes = rows.map(rowToNote)
    notes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
    return notes
  },

  async getById(id: string): Promise<Note | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query("SELECT * FROM notes WHERE id = ? AND user_id = ?", [id, DEFAULT_USER_ID])
      if (!res.values || res.values.length === 0) return null
      return rowToNote(res.values[0])
    }
    const rows = webDb.query('notes', (r) => r.id === id)
    if (rows.length === 0) return null
    return rowToNote(rows[0])
  },

  async create(data: { title?: string; content: string; color?: string; isPinned?: boolean; tags?: string[] }): Promise<Note> {
    const id = generateId()
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        `INSERT INTO notes (id, user_id, title, content, color, is_pinned, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, DEFAULT_USER_ID, data.title || null, data.content, data.color || '#FFFFFF',
         data.isPinned ? 1 : 0, JSON.stringify(data.tags || []), now, now]
      )
    } else {
      webDb.insert('notes', {
        id, user_id: DEFAULT_USER_ID, title: data.title || null, content: data.content,
        color: data.color || '#FFFFFF', isPinned: data.isPinned || false, is_pinned: data.isPinned ? 1 : 0,
        tags: data.tags || [], is_archived: false, isArchived: false,
        created_at: now, updated_at: now, createdAt: now, updatedAt: now,
      })
    }
    return (await this.getById(id))!
  },

  async update(id: string, data: Partial<{ title: string; content: string; color: string; isPinned: boolean; tags: string[] }>): Promise<Note | null> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const sets: string[] = []
      const vals: unknown[] = []
      if (data.title !== undefined) { sets.push("title = ?"); vals.push(data.title) }
      if (data.content !== undefined) { sets.push("content = ?"); vals.push(data.content) }
      if (data.color !== undefined) { sets.push("color = ?"); vals.push(data.color) }
      if (data.isPinned !== undefined) { sets.push("is_pinned = ?"); vals.push(data.isPinned ? 1 : 0) }
      if (data.tags !== undefined) { sets.push("tags = ?"); vals.push(JSON.stringify(data.tags)) }
      sets.push("updated_at = ?"); vals.push(now)
      vals.push(id); vals.push(DEFAULT_USER_ID)
      await db.run(`UPDATE notes SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`, vals as string[])
    } else {
      const mapped: Record<string, unknown> = { updated_at: now, updatedAt: now }
      if (data.title !== undefined) mapped.title = data.title
      if (data.content !== undefined) mapped.content = data.content
      if (data.color !== undefined) mapped.color = data.color
      if (data.isPinned !== undefined) { mapped.isPinned = data.isPinned; mapped.is_pinned = data.isPinned ? 1 : 0 }
      if (data.tags !== undefined) mapped.tags = data.tags
      webDb.update('notes', id, mapped)
    }
    return this.getById(id)
  },

  async delete(id: string): Promise<void> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run("UPDATE notes SET is_archived = 1, updated_at = ? WHERE id = ? AND user_id = ?", [now, id, DEFAULT_USER_ID])
    } else {
      webDb.update('notes', id, { is_archived: true, isArchived: true, updated_at: now })
    }
  },
}
