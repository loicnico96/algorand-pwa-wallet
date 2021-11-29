import { useCallback, useState } from "react"

import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { handleGenericError } from "lib/utils/error"
import { keys } from "lib/utils/objects"

export interface FieldOptions {
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  required?: boolean
}

export interface FieldProps extends FieldOptions {
  onChange: (value: string) => void
  name: string
  value: string
}

export interface UseFormOptions<K extends string> {
  fields: Record<K, FieldOptions>
  initialValues: Record<K, string>
  onError?: (error: Error) => void
  onSubmit: (values: Record<K, string>) => Promise<void>
}

export interface UseFormResult<K extends string> {
  fieldProps: Record<K, FieldProps>
  isSubmitting: boolean
  isValid: boolean
  resetForm: () => void
  submitForm: () => void
}

export function useForm<K extends string>({
  fields,
  initialValues,
  onError = handleGenericError,
  onSubmit,
}: UseFormOptions<K>): UseFormResult<K> {
  const [values, setValues] = useState(initialValues)

  const fieldProps = keys(fields).reduce((result, name) => {
    result[name] = {
      ...fields[name],
      onChange: value => setValues(current => ({ ...current, [name]: value })),
      value: values[name],
      name,
    }
    return result
  }, {} as Record<K, FieldProps>)

  const isValid = keys(fields).every(name => {
    const field = fields[name]
    const value = values[name]

    if (field.required) {
      if (value.length === 0) {
        return false
      }
    }

    if (field.maxLength !== undefined) {
      if (value.length > field.maxLength) {
        return false
      }
    }

    if (field.minLength !== undefined) {
      if (value.length < field.minLength) {
        return false
      }
    }

    if (field.pattern !== undefined) {
      if (!value.match(field.pattern)) {
        return false
      }
    }

    return true
  })

  const [submitForm, isSubmitting] = useAsyncHandler(async () => {
    if (isValid) {
      await onSubmit(values)
    }
  }, onError)

  const resetForm = useCallback(() => setValues(initialValues), [initialValues])

  return {
    fieldProps,
    isSubmitting,
    isValid,
    resetForm,
    submitForm,
  }
}
