import { useRouter } from "next/router"
import { useCallback, useEffect, useRef } from "react"

import { useRouteParam } from "hooks/useRouteParam"
import { DefaultLogger } from "lib/utils/logger"
import { RouteParam } from "lib/utils/navigation"

export interface UseStepsParams<T extends string> {
  onFirstStepBack: () => unknown
  onLastStepNext: () => unknown
  steps: T[]
}

export interface UseStepsResult<T extends string> {
  onBack: () => Promise<void>
  onNext: () => Promise<void>
  step: T
}

export function useSteps<T extends string>({
  onFirstStepBack,
  onLastStepNext,
  steps,
}: UseStepsParams<T>): UseStepsResult<T> {
  const lastStepIndex = useRef(0)

  const router = useRouter()
  const stepParam = useRouteParam(RouteParam.STEP) ?? ""
  const stepIndex = steps.indexOf(stepParam as T)
  const step =
    stepIndex < 0 || stepIndex > lastStepIndex.current
      ? steps[lastStepIndex.current] ?? steps[0]
      : steps[stepIndex]

  useEffect(() => {
    if (router.isReady && step !== stepParam) {
      router.replace(step).catch(error => {
        DefaultLogger.error(error)
      })
    }
  }, [router, stepParam, step])

  const onBack = useCallback(async () => {
    const backStep = steps[steps.indexOf(step) - 1]
    if (backStep) {
      router.back()
    } else {
      await onFirstStepBack()
    }
  }, [onFirstStepBack, router, step, steps])

  const onNext = useCallback(async () => {
    lastStepIndex.current = steps.indexOf(step) + 1
    const nextStep = steps[steps.indexOf(step) + 1]
    if (nextStep) {
      await router.push(nextStep)
    } else {
      await onLastStepNext()
    }
  }, [onLastStepNext, router, step, steps])

  return {
    onBack,
    onNext,
    step,
  }
}
