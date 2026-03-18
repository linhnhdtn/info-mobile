import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  const { display } = await LocalNotifications.checkPermissions()
  if (display === 'granted') return true
  const result = await LocalNotifications.requestPermissions()
  return result.display === 'granted'
}

export async function scheduleEventReminder(opts: {
  eventId: string
  title: string
  body: string
  at: Date
}) {
  if (!Capacitor.isNativePlatform()) return

  const granted = await requestNotificationPermission()
  if (!granted) return

  // Use a numeric hash of the event ID for notification ID
  const notifId = hashStringToInt(opts.eventId)

  // Cancel any existing notification for this event first
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] })
  } catch {}

  // Don't schedule if the time is in the past
  if (opts.at.getTime() <= Date.now()) return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notifId,
        title: opts.title,
        body: opts.body,
        schedule: { at: opts.at },
        sound: 'default',
        smallIcon: 'ic_launcher',
      },
    ],
  })
}

export async function cancelEventReminder(eventId: string) {
  if (!Capacitor.isNativePlatform()) return
  const notifId = hashStringToInt(eventId)
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] })
  } catch {}
}

function hashStringToInt(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 2147483647 || 1
}
