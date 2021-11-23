import { RouteParam } from "lib/utils/navigation"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { getRouteParam } from "./useRouteParam"

export function useParamState(
  key: RouteParam
): [
  state: string,
  setState: (newState: string) => Promise<void>,
  isReady: boolean
] {
  const router = useRouter()

  const state = getRouteParam(router.query, key) ?? ""

  const setState = useCallback(
    async (newState: string) => {
      const oldState = getRouteParam(router.query, key) ?? ""
      console.log(key, oldState, newState, oldState === newState)
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
