export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]"
}
