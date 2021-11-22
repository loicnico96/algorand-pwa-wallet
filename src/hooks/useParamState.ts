import { DefaultLogger } from "lib/utils/logger"
import { RouteParam } from "lib/utils/navigation"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { getRouteParam } from "./useRouteParam"

export function useParamState(
  key: RouteParam
): [state: string | null, setState: (newState: string | null) => void] {
  const router = useRouter()
  const state = getRouteParam(router.query, key)

  const setState = useCallback(
    (newState: string | null) => {
      const oldState = getRouteParam(router.query, key)
      if (oldState !== newState) {
        const query = { ...router.query }

        if (newState) {
          query[key] = newState
        } else {
          delete query[key]
        }

        router
          .replace({ query }, undefined, { shallow: true })
          .catch(DefaultLogger.error)
      }
    },
    [key, router]
  )

  return [state, setState]
}
