import { toast } from "react-toastify"

import { DefaultLogger } from "./logger"

export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function toError(value: unknown): Error {
  if (isError(value)) {
    return value
  }

  if (typeof value === "string") {
    return Error(value)
  }

  return Object.assign(Error("Unknown error"), { originalError: value })
}

export function handleGenericError(error: Error) {
  DefaultLogger.error(error)
  toast.error(error.message)
}
