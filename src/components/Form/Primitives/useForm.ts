import { useCallback, useState } from "react"

import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { handleGenericError } from "lib/utils/error"

export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T
  onError?: (error: Error) => void
  onSubmit: (values: T) => Promise<void>
  validators?: {
    [K in keyof T]?: (value: T[K]) => boolean
  }
}

export interface UseFormResult<T extends Record<string, unknown>> {
  isSubmitting: boolean
  isValid: boolean
  onSubmit: () => void
  setValue: <K extends keyof T>(name: K, value: T[K]) => void
  values: T
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onError = handleGenericError,
  onSubmit,
  validators,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState(initialValues)

  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    setValues(current => ({ ...current, [key]: value }))
  }, [])

  const isValid =
    !validators ||
    Object.keys(validators).some((name: keyof T) => {
      const validator = validators[name]
      return !validator || validator(values[name])
    })

  const [onSubmitAsync, isSubmitting] = useAsyncHandler(
    useCallback(async () => {
      if (isValid) {
        await onSubmit(values)
      }
    }, [isValid, onSubmit, values]),
    onError
  )

  return {
    isSubmitting,
    isValid,
    onSubmit: onSubmitAsync,
    setValue,
    values,
  }
}
