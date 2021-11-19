import { Context, createContext, ReactNode } from "react"

export interface ProviderProps {
  children: ReactNode
}

export function createEmptyContext<T extends {}>(): Context<T> {
  return createContext(
    new Proxy({} as T, {
      get: () => {
        throw Error(`Invalid context - Did you forget to use a provider?`)
      },
      set: () => {
        throw Error(`Invalid context - Did you forget to use a provider?`)
      },
    })
  )
}
