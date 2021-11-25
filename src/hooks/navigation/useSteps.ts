import { useRouter } from "next/router"
import { useCallback, useEffect, useRef } from "react"

import { useRouteParam } from "./useRouteParam"
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
  const lastStep = useRef(0)

  const router = useRouter()
  const stepParam = useRouteParam(RouteParam.STEP)
  const stepIndex = steps.indexOf(stepParam as T)
  const step =
    stepIndex < 0 || stepIndex > lastStep.current ? lastStep.current : stepIndex

  useEffect(() => {
    if (router.isReady && steps[step] !== stepParam) {
      router.replace(steps[step], undefined, { shallow: true })
    }
  }, [router, stepParam, step, steps])

  const onBack = useCallback(async () => {
    if (step > 0) {
      router.back()
    } else {
      await onFirstStepBack()
    }
  }, [onFirstStepBack, router, step])

  const onNext = useCallback(async () => {
    if (step < steps.length - 1) {
      lastStep.current = step + 1
      await router.push(steps[step + 1])
    } else {
      await onLastStepNext()
    }
  }, [onLastStepNext, router, step, steps])

  return {
    onBack,
    onNext,
    step: steps[step],
  }
}
