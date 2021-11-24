import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"

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
  const [step, setStep] = useState(0)

  const router = useRouter()
  const stepParam = useRouteParam(RouteParam.STEP)

  useEffect(() => {
    if (router.isReady && steps[step] !== stepParam) {
      router.replace(steps[step], undefined, { shallow: true })
    }
  }, [router, stepParam, step, steps])

  const onBack = useCallback(async () => {
    if (step > 0) {
      setStep(step - 1)
    } else {
      await onFirstStepBack()
    }
  }, [onFirstStepBack, step])

  const onNext = useCallback(async () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      await onLastStepNext()
    }
  }, [onLastStepNext, step, steps])

  return {
    onBack,
    onNext,
    step: steps[step],
  }
}
