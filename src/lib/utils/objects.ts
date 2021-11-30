export type Key<T> = keyof T & string
export type Value<T> = T[keyof T]
export type Overwrite<T, U> = Omit<T, keyof U> & U

export function keys<T extends Record<string, unknown>>(obj: T): Key<T>[] {
  return Object.keys(obj)
}
