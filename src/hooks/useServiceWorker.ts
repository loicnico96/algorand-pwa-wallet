import { isBrowser } from "lib/utils/environment"
import { useEffect } from "react"

/**
 * Returns true if service workers are supported by this client.
 */
export function isServiceWorkerSupported(): boolean {
  return isBrowser && "serviceWorker" in navigator
}

/**
 * Registers a service worker and its event listeners, if supported.
 * @note This should be called once in the top-level application component.
 */
export function useServiceWorker(): void {
  useEffect(() => {
    if (isServiceWorkerSupported() && window.workbox !== undefined) {
      const wb = window.workbox

      wb.addEventListener("installed", event => {
        console.log(`[WB] ${event.type}`, event)
      })

      wb.addEventListener("controlling", event => {
        console.log(`[WB] ${event.type}`, event)
      })

      wb.addEventListener("waiting", event => {
        console.log(`[WB] ${event.type}`, event)

        if (prompt("New version available. Reload now?")) {
          console.log("[WB] accepted")

          wb.addEventListener("controlling", () => {
            window.location.reload()
          })

          wb.messageSkipWaiting()
        } else {
          console.log("[WB] rejected")
        }
      })

      wb.addEventListener("activated", event => {
        console.log(`[WB] ${event.type}`, event)
      })

      wb.addEventListener("message", event => {
        console.log(`[WB] ${event.type}`, event)
      })

      console.log("[WB] register")

      wb.register()
    }
  }, [])
}
