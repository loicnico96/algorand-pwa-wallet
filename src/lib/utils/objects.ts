export type Key<T extends Record<string, unknown>> = keyof T & string
export type Value<T extends Record<string, unknown>> = T[Key<T>]

export function keys<T extends Record<string, unknown>>(obj: T): Key<T>[] {
  return Object.keys(obj)
}
