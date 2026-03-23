import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb, generateId } from '../database'
import { webDb } from '../web-storage'
import type { HealthLog, HealthPhoto } from '@/types'

function rowToLog(r: Record<string, unknown>): HealthLog {
  return {
    id: r.id as string,
    date: r.date as string,
    weight: (r.weight ?? null) as number | null,
    height: (r.height ?? null) as number | null,
    bloodPressureSys: (r.blood_pressure_sys ?? r.bloodPressureSys ?? null) as number | null,
    bloodPressureDia: (r.blood_pressure_dia ?? r.bloodPressureDia ?? null) as number | null,
    heartRate: (r.heart_rate ?? r.heartRate ?? null) as number | null,
    sleepHours: (r.sleep_hours ?? r.sleepHours ?? null) as number | null,
    waterMl: (r.water_ml ?? r.waterMl ?? null) as number | null,
    steps: (r.steps ?? null) as number | null,
    exerciseMinutes: (r.exercise_minutes ?? r.exerciseMinutes ?? null) as number | null,
    mood: (r.mood ?? null) as string | null,
    note: (r.note ?? null) as string | null,
    createdAt: (r.created_at ?? r.createdAt ?? '') as string,
    updatedAt: (r.updated_at ?? r.updatedAt ?? '') as string,
  }
}

function rowToPhoto(r: Record<string, unknown>): HealthPhoto {
  return {
    id: r.id as string,
    healthLogId: (r.health_log_id ?? r.healthLogId) as string,
    filePath: (r.file_path ?? r.filePath) as string,
    caption: (r.caption ?? null) as string | null,
    createdAt: (r.created_at ?? r.createdAt ?? '') as string,
  }
}

export const healthRepo = {
  async getByDate(date: string): Promise<HealthLog | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        "SELECT * FROM health_logs WHERE user_id = ? AND date = ?",
        [DEFAULT_USER_ID, date]
      )
      if (!res.values || res.values.length === 0) return null
      return rowToLog(res.values[0])
    }
    const rows = webDb.query('health_logs', (r) => r.user_id === DEFAULT_USER_ID && r.date === date)
    if (rows.length === 0) return null
    return rowToLog(rows[0])
  },

  async getRange(startDate: string, endDate: string): Promise<HealthLog[]> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        "SELECT * FROM health_logs WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC",
        [DEFAULT_USER_ID, startDate, endDate]
      )
      return (res.values || []).map(rowToLog)
    }
    const rows = webDb.query('health_logs', (r) =>
      r.user_id === DEFAULT_USER_ID &&
      (r.date as string) >= startDate &&
      (r.date as string) <= endDate
    )
    return rows.map(rowToLog).sort((a, b) => a.date.localeCompare(b.date))
  },

  async getLatestHeight(): Promise<number | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        "SELECT height FROM health_logs WHERE user_id = ? AND height IS NOT NULL ORDER BY date DESC LIMIT 1",
        [DEFAULT_USER_ID]
      )
      if (!res.values || res.values.length === 0) return null
      return res.values[0].height as number
    }
    const rows = webDb.query('health_logs', (r) => r.user_id === DEFAULT_USER_ID && r.height != null)
    if (rows.length === 0) return null
    const sorted = rows.sort((a, b) => (b.date as string).localeCompare(a.date as string))
    return sorted[0].height as number
  },

  async upsert(date: string, data: Partial<Omit<HealthLog, 'id' | 'date' | 'createdAt' | 'updatedAt'>>): Promise<HealthLog> {
    const now = new Date().toISOString()
    const existing = await this.getByDate(date)

    if (existing) {
      if (IS_NATIVE) {
        const db = await getSqliteDb()
        const sets: string[] = []
        const vals: unknown[] = []
        if (data.weight !== undefined) { sets.push("weight = ?"); vals.push(data.weight) }
        if (data.height !== undefined) { sets.push("height = ?"); vals.push(data.height) }
        if (data.bloodPressureSys !== undefined) { sets.push("blood_pressure_sys = ?"); vals.push(data.bloodPressureSys) }
        if (data.bloodPressureDia !== undefined) { sets.push("blood_pressure_dia = ?"); vals.push(data.bloodPressureDia) }
        if (data.heartRate !== undefined) { sets.push("heart_rate = ?"); vals.push(data.heartRate) }
        if (data.sleepHours !== undefined) { sets.push("sleep_hours = ?"); vals.push(data.sleepHours) }
        if (data.waterMl !== undefined) { sets.push("water_ml = ?"); vals.push(data.waterMl) }
        if (data.steps !== undefined) { sets.push("steps = ?"); vals.push(data.steps) }
        if (data.exerciseMinutes !== undefined) { sets.push("exercise_minutes = ?"); vals.push(data.exerciseMinutes) }
        if (data.mood !== undefined) { sets.push("mood = ?"); vals.push(data.mood) }
        if (data.note !== undefined) { sets.push("note = ?"); vals.push(data.note) }
        sets.push("updated_at = ?"); vals.push(now)
        vals.push(existing.id); vals.push(DEFAULT_USER_ID)
        await db.run(`UPDATE health_logs SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`, vals as string[])
        const res = await db.query("SELECT * FROM health_logs WHERE id = ?", [existing.id])
        return rowToLog(res.values![0])
      } else {
        const mapped: Record<string, unknown> = { updated_at: now, updatedAt: now }
        if (data.weight !== undefined) mapped.weight = data.weight
        if (data.height !== undefined) mapped.height = data.height
        if (data.bloodPressureSys !== undefined) { mapped.blood_pressure_sys = data.bloodPressureSys; mapped.bloodPressureSys = data.bloodPressureSys }
        if (data.bloodPressureDia !== undefined) { mapped.blood_pressure_dia = data.bloodPressureDia; mapped.bloodPressureDia = data.bloodPressureDia }
        if (data.heartRate !== undefined) { mapped.heart_rate = data.heartRate; mapped.heartRate = data.heartRate }
        if (data.sleepHours !== undefined) { mapped.sleep_hours = data.sleepHours; mapped.sleepHours = data.sleepHours }
        if (data.waterMl !== undefined) { mapped.water_ml = data.waterMl; mapped.waterMl = data.waterMl }
        if (data.steps !== undefined) mapped.steps = data.steps
        if (data.exerciseMinutes !== undefined) { mapped.exercise_minutes = data.exerciseMinutes; mapped.exerciseMinutes = data.exerciseMinutes }
        if (data.mood !== undefined) mapped.mood = data.mood
        if (data.note !== undefined) mapped.note = data.note
        webDb.update('health_logs', existing.id, mapped)
        const rows = webDb.query('health_logs', (r) => r.id === existing.id)
        return rowToLog(rows[0])
      }
    }

    // Create new
    const id = generateId()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        `INSERT INTO health_logs (id, user_id, date, weight, height, blood_pressure_sys, blood_pressure_dia, heart_rate, sleep_hours, water_ml, steps, exercise_minutes, mood, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, DEFAULT_USER_ID, date, data.weight ?? null, data.height ?? null, data.bloodPressureSys ?? null, data.bloodPressureDia ?? null, data.heartRate ?? null, data.sleepHours ?? null, data.waterMl ?? null, data.steps ?? null, data.exerciseMinutes ?? null, data.mood ?? null, data.note ?? null, now, now]
      )
      const res = await db.query("SELECT * FROM health_logs WHERE id = ?", [id])
      return rowToLog(res.values![0])
    } else {
      const row = {
        id, user_id: DEFAULT_USER_ID, date,
        weight: data.weight ?? null, height: data.height ?? null,
        blood_pressure_sys: data.bloodPressureSys ?? null, bloodPressureSys: data.bloodPressureSys ?? null,
        blood_pressure_dia: data.bloodPressureDia ?? null, bloodPressureDia: data.bloodPressureDia ?? null,
        heart_rate: data.heartRate ?? null, heartRate: data.heartRate ?? null,
        sleep_hours: data.sleepHours ?? null, sleepHours: data.sleepHours ?? null,
        water_ml: data.waterMl ?? null, waterMl: data.waterMl ?? null,
        steps: data.steps ?? null,
        exercise_minutes: data.exerciseMinutes ?? null, exerciseMinutes: data.exerciseMinutes ?? null,
        mood: data.mood ?? null, note: data.note ?? null,
        created_at: now, createdAt: now, updated_at: now, updatedAt: now,
      }
      webDb.insert('health_logs', row)
      return rowToLog(row)
    }
  },

  async delete(id: string): Promise<void> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run("DELETE FROM health_photos WHERE health_log_id = ? AND user_id = ?", [id, DEFAULT_USER_ID])
      await db.run("DELETE FROM health_logs WHERE id = ? AND user_id = ?", [id, DEFAULT_USER_ID])
    } else {
      const photos = webDb.query('health_photos', (r) => r.health_log_id === id)
      for (const p of photos) {
        webDb.delete('health_photos', p.id as string)
      }
      webDb.delete('health_logs', id)
    }
  },

  async addPhoto(healthLogId: string, filePath: string, caption?: string): Promise<HealthPhoto> {
    const id = generateId()
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        "INSERT INTO health_photos (id, health_log_id, user_id, file_path, caption, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [id, healthLogId, DEFAULT_USER_ID, filePath, caption ?? null, now]
      )
    } else {
      webDb.insert('health_photos', {
        id, health_log_id: healthLogId, healthLogId,
        user_id: DEFAULT_USER_ID,
        file_path: filePath, filePath,
        caption: caption ?? null,
        created_at: now, createdAt: now,
      })
    }
    return { id, healthLogId, filePath, caption: caption ?? null, createdAt: now }
  },

  async getPhotos(healthLogId: string): Promise<HealthPhoto[]> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        "SELECT * FROM health_photos WHERE health_log_id = ? AND user_id = ? ORDER BY created_at ASC",
        [healthLogId, DEFAULT_USER_ID]
      )
      return (res.values || []).map(rowToPhoto)
    }
    const rows = webDb.query('health_photos', (r) => r.health_log_id === healthLogId && r.user_id === DEFAULT_USER_ID)
    return rows.map(rowToPhoto).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },

  async deletePhoto(id: string): Promise<void> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run("DELETE FROM health_photos WHERE id = ? AND user_id = ?", [id, DEFAULT_USER_ID])
    } else {
      webDb.delete('health_photos', id)
    }
  },
}
