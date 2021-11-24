import { RouteParam } from "lib/utils/navigation"
import { useCallback, useEffect } from "react"
import { useParamState, UseParamStateResult } from "./useParamState"

export function useIntParamState(
  key: RouteParam,
  defaultState: number = 0
): UseParamStateResult<number> {
  const [state, setState, isReady] = useParamState(key)

  const parsedState = Number.parseInt(state, 10)
  const intState = Number.isNaN(parsedState) ? defaultState : parsedState

  const setIntState = useCallback(
    (newState: number) => setState(String(newState)),
    [setState]
  )

  useEffect(() => {
    if (isReady && state !== String(intState)) {
      setState(String(intState))
    }
  }, [isReady, state, intState, setState])

  return [intState, setIntState, isReady]
}
