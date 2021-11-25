export function fill<T>(count: number, mapFn: (index: number) => T): T[] {
  return Array(count)
    .fill(undefined)
    .map((_, index) => mapFn(index))
}
