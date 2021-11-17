import { Context, createContext } from "react"

export function createEmptyContext<T extends {}>(context: string): Context<T> {
  return createContext(
    new Proxy({} as T, {
      get: () => {
        throw Error(`Invalid ${context} - Did you forget to use a provider?`)
      },
      set: () => {
        throw Error(`Invalid ${context} - Did you forget to use a provider?`)
      },
    })
  )
}
