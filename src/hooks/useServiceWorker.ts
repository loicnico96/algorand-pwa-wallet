import { isBrowser } from "lib/utils/environment"
import { createLogger } from "lib/utils/logger"
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
      const logger = createLogger("Workbox")
      const wb = window.workbox

      wb.addEventListener("installed", event => {
        logger.log("Installed", event)
      })

      wb.addEventListener("controlling", event => {
        logger.log("Controlling", event)
      })

      wb.addEventListener("waiting", event => {
        logger.log("Waiting", event)

        if (prompt("New version available. Reload now?")) {
          logger.log("Accepted by user")

          wb.addEventListener("controlling", () => {
            window.location.reload()
          })

          wb.messageSkipWaiting()
        } else {
          logger.log("Rejected by user")
        }
      })

      wb.addEventListener("activated", event => {
        logger.log("Activated", event)
      })

      wb.addEventListener("message", event => {
        logger.log("Message", event)
      })

      logger.log("Registering...")

      wb.register()
    }
  }, [])
}
