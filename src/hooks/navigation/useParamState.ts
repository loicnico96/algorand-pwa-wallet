import { RouteParam } from "lib/utils/navigation"
import { NextRouter, useRouter } from "next/router"
import { useCallback } from "react"

export type UseParamStateResult<T> = [
  state: T,
  setState: (newState: T) => Promise<void>,
  isReady: boolean
]

export function getParamState(router: NextRouter, key: RouteParam): string {
  const value = router.query[key]
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

export function useParamState(key: RouteParam): UseParamStateResult<string> {
  const router = useRouter()

  const state = getParamState(router, key)

  const setState = useCallback(
    async (newState: string) => {
      const oldState = getParamState(router, key)
      if (oldState !== newState) {
        const query = { ...router.query }

        if (newState) {
          query[key] = newState
        } else {
          delete query[key]
        }

        await router.replace({ query }, undefined, { shallow: true })
      }
    },
    [key, router]
  )

  return [state, setState, router.isReady]
}
