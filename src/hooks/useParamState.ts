import { DefaultLogger } from "lib/utils/logger"
import { RouteParam } from "lib/utils/navigation"
import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"
import { getRouteParam } from "./useRouteParam"

export function useParamState(
  key: RouteParam
): [state: string, setState: (newState: string) => void, isReady: boolean] {
  const router = useRouter()

  const state = getRouteParam(router.query, key) ?? ""

  const setState = useCallback(
    (newState: string) => {
      const oldState = getRouteParam(router.query, key) ?? ""
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

  return [state, setState, router.isReady]
}

export function useIntParamState(
  key: RouteParam,
  defaultState: number = 0
): [state: number, setState: (newState: number) => void, isReady: boolean] {
  const [state, setState, isReady] = useParamState(key)

  const parsedState = Number.parseInt(state, 10)
  const intState = Number.isNaN(parsedState) ? defaultState : parsedState

  const setIntState = useCallback(
    (newState: number) => {
      setState(String(newState))
    },
    [setState]
  )

  useEffect(() => {
    if (isReady && state !== String(intState)) {
      setState(String(intState))
    }
  }, [isReady, state, intState, setState])

  return [intState, setIntState, isReady]
}
