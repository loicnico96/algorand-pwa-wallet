import { toast } from "react-toastify"

import { defaultLogger } from "./logger"

export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function toError(value: unknown): Error {
  if (isError(value)) {
    // Algorand API errors return a JSON as message
    if (value.message.startsWith("{")) {
      try {
        const { message } = JSON.parse(value.message)
        return Error(message)
      } catch (parseError) {
        return value
      }
    }

    return value
  }

  if (typeof value === "string") {
    return Error(value)
  }

  return Object.assign(Error("Unknown error"), { originalError: value })
}

export function handleGenericError(error: unknown): void {
  defaultLogger.error(error)
  toast.error(toError(error).message)
}
