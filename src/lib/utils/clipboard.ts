import { toast } from "react-toastify"

import { createLogger } from "./logger"

const clipboardLogger = createLogger("Clipboard")

export async function toClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    toast.info("Copied to clipboard.")
  } catch (error) {
    clipboardLogger.error(error)
  }
}
