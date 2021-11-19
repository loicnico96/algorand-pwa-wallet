import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"

import { useRouteParam } from "hooks/useRouteParam"
import { createLogger } from "lib/utils/logger"
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

const logger = createLogger("Router")

export function useSteps<T extends string>({
  onFirstStepBack,
  onLastStepNext,
  steps,
}: UseStepsParams<T>): UseStepsResult<T> {
  const [step, setStep] = useState(steps[0])

  const router = useRouter()
  const stepParam = useRouteParam(RouteParam.STEP) ?? ""

  useEffect(() => {
    // Synchronize browser URL with the current state
    if (stepParam !== step) {
      router.replace(step, undefined, { shallow: true }).catch(logger.error)
    }
  }, [router, step, stepParam])

  const onBack = useCallback(async () => {
    const backStep = steps[steps.indexOf(step) - 1]
    if (backStep) {
      setStep(backStep)
    } else {
      await onFirstStepBack()
    }
  }, [onFirstStepBack, step, steps])

  const onNext = useCallback(async () => {
    const nextStep = steps[steps.indexOf(step) + 1]
    if (nextStep) {
      setStep(nextStep)
    } else {
      await onLastStepNext()
    }
  }, [onLastStepNext, step, steps])

  return {
    onBack,
    onNext,
    step,
  }
}
