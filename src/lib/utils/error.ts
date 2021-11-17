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
