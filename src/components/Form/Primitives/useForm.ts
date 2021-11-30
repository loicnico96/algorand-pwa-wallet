import { useCallback, useState } from "react"

import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { handleGenericError } from "lib/utils/error"
import { Key, keys } from "lib/utils/objects"

export interface FieldOptionsBase {
  required?: boolean
}

export interface FieldOptionsNumber extends FieldOptionsBase {
  max?: number
  min?: number
  type: "number"
}

export interface FieldOptionsText extends FieldOptionsBase {
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  type: "password" | "text"
}

export type FieldOptions = FieldOptionsNumber | FieldOptionsText

export type FieldProps = FieldOptions & {
  onChange: (value: string) => void
  name: string
  value: string
}

export interface UseFormOptions<T extends Record<string, FieldOptions>> {
  fields: T
  initialValues: Record<Key<T>, string>
  onError?: (error: Error) => void
  onSubmit: (values: Record<Key<T>, string>) => Promise<void>
}

export interface UseFormResult<T extends Record<string, FieldOptions>> {
  fieldProps: Record<Key<T>, FieldProps>
  isSubmitting: boolean
  isValid: boolean
  resetForm: () => void
  setValue: (name: Key<T>, value: string) => void
  setValues: (values: Record<Key<T>, string>) => void
  submitForm: () => void
  values: Record<Key<T>, string>
}

export function useForm<T extends Record<string, FieldOptions>>({
  fields,
  initialValues,
  onError = handleGenericError,
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState(initialValues)

  const setValue = useCallback((name: Key<T>, value: string) => {
    setValues(currentValues => ({
      ...currentValues,
      [name]: value,
    }))
  }, [])

  const fieldProps = keys(fields).reduce((result, name) => {
    result[name] = {
      ...(fields[name] as FieldOptions),
      onChange: value => setValue(name, value),
      value: values[name],
      name,
    }

    return result
  }, {} as Record<Key<T>, FieldProps>)

  const isValid = keys(fields).every(name => {
    const field = fields[name]
    const value = values[name]

    if (value.length === 0) {
      return !field.required
    }

    if (field.type === "number") {
      const numberValue = Number.parseInt(value, 10)

      if (!Number.isInteger(numberValue)) {
        return false
      }

      if (field.max !== undefined) {
        if (numberValue > field.max) {
          return false
        }
      }

      if (field.min !== undefined) {
        if (numberValue < field.min) {
          return false
        }
      }

      return true
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
    setValue,
    setValues,
    submitForm,
    values,
  }
}
