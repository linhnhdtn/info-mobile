import { DEFAULT_USER_ID, IS_NATIVE, getSqliteDb } from '../database'
import { webDb } from '../web-storage'
import type { UserProfile } from '@/types'

function rowToProfile(r: Record<string, unknown>): UserProfile {
  return {
    id: r.id as string,
    firstName: (r.first_name ?? r.firstName ?? null) as string | null,
    lastName: (r.last_name ?? r.lastName ?? null) as string | null,
    phone: (r.phone ?? null) as string | null,
    email: (r.email ?? null) as string | null,
    address: (r.address ?? null) as string | null,
    city: (r.city ?? null) as string | null,
    country: (r.country ?? null) as string | null,
    birthday: (r.birthday ?? null) as string | null,
    avatarUrl: (r.avatar_url ?? r.avatarUrl ?? null) as string | null,
    bio: (r.bio ?? null) as string | null,
  }
}

export const profileRepo = {
  async get(): Promise<UserProfile | null> {
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      const res = await db.query(
        "SELECT * FROM profiles WHERE user_id = ?", [DEFAULT_USER_ID]
      )
      if (!res.values || res.values.length === 0) return null
      return rowToProfile(res.values[0])
    }
    const rows = webDb.query('profiles', (r) => r.user_id === DEFAULT_USER_ID)
    if (rows.length === 0) return null
    return rowToProfile(rows[0])
  },

  async update(data: Partial<UserProfile>): Promise<UserProfile | null> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        `UPDATE profiles SET
          first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone), email = COALESCE(?, email),
          address = COALESCE(?, address), city = COALESCE(?, city),
          country = COALESCE(?, country), birthday = COALESCE(?, birthday),
          bio = COALESCE(?, bio), updated_at = ?
        WHERE user_id = ?`,
        [data.firstName ?? null, data.lastName ?? null, data.phone ?? null, data.email ?? null,
         data.address ?? null, data.city ?? null, data.country ?? null, data.birthday ?? null,
         data.bio ?? null, now, DEFAULT_USER_ID]
      )
    } else {
      const mapped: Record<string, unknown> = { updated_at: now }
      if (data.firstName !== undefined) mapped.firstName = data.firstName
      if (data.lastName !== undefined) mapped.lastName = data.lastName
      if (data.phone !== undefined) mapped.phone = data.phone
      if (data.email !== undefined) mapped.email = data.email
      if (data.address !== undefined) mapped.address = data.address
      if (data.city !== undefined) mapped.city = data.city
      if (data.country !== undefined) mapped.country = data.country
      if (data.birthday !== undefined) mapped.birthday = data.birthday
      if (data.bio !== undefined) mapped.bio = data.bio
      webDb.updateWhere('profiles', (r) => r.user_id === DEFAULT_USER_ID, mapped)
    }
    return this.get()
  },

  async updateAvatar(avatarUrl: string): Promise<void> {
    const now = new Date().toISOString()
    if (IS_NATIVE) {
      const db = await getSqliteDb()
      await db.run(
        "UPDATE profiles SET avatar_url = ?, updated_at = ? WHERE user_id = ?",
        [avatarUrl, now, DEFAULT_USER_ID]
      )
    } else {
      webDb.updateWhere('profiles', (r) => r.user_id === DEFAULT_USER_ID, { avatarUrl, updated_at: now })
    }
  },
}
