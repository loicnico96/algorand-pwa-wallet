import { isArray, isRecord } from "./types"

export function toCamelCase(key: string): string {
  return key.replaceAll(/[-_]./g, match => match[1].toUpperCase())
}

export function toCamelCaseDeep(value: unknown): any {
  if (isArray(value)) {
    return value.map(toCamelCaseDeep)
  }

  if (isRecord(value)) {
    return Object.keys(value).reduce<Record<string, unknown>>((result, key) => {
      result[toCamelCase(key)] = toCamelCaseDeep(value[key])
      return result
    }, {})
  }

  return value
}
