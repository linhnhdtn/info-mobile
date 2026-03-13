import { useEffect, useRef } from "react"
import { App } from "@capacitor/app"
import { Capacitor } from "@capacitor/core"

/**
 * Runs callback when the app resumes from background (native)
 * or when the tab becomes visible again (web).
 */
export function useAppResume(callback: () => void) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = App.addListener("resume", () => {
        cbRef.current()
      })
      return () => { listener.then((l) => l.remove()) }
    } else {
      const handler = () => {
        if (document.visibilityState === "visible") {
          cbRef.current()
        }
      }
      document.addEventListener("visibilitychange", handler)
      return () => document.removeEventListener("visibilitychange", handler)
    }
  }, [])
}
