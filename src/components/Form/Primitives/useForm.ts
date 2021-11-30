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
  type: "string"
}

export type FieldOptions = FieldOptionsNumber | FieldOptionsText

export type FieldValue<T extends FieldOptions> = {
  number: number
  string: string
}[T["type"]]

export type FieldValues<T extends Record<string, FieldOptions>> = {
  [K in Key<T>]: FieldValue<T[K]>
}

export type FieldProps<T extends FieldOptions> = T & {
  onChange: (value: FieldValue<T>) => void
  name: string
  value: FieldValue<T>
}

export interface UseFormOptions<T extends Record<string, FieldOptions>> {
  fields: T
  initialValues: FieldValues<T>
  onError?: (error: Error) => void
  onSubmit: (values: FieldValues<T>) => Promise<void>
}

export interface UseFormResult<T extends Record<string, FieldOptions>> {
  fieldProps: {
    [K in Key<T>]: FieldProps<T[K]>
  }
  isSubmitting: boolean
  isValid: boolean
  resetForm: () => void
  setValue: <K extends Key<T>>(name: K, value: FieldValue<T[K]>) => void
  setValues: (values: FieldValues<T>) => void
  submitForm: () => void
  values: FieldValues<T>
}

export function useForm<T extends Record<string, FieldOptions>>({
  fields,
  initialValues,
  onError = handleGenericError,
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState(initialValues)

  const setValue = useCallback(
    <K extends Key<T>>(name: K, value: FieldValue<T[K]>) => {
      setValues(currentValues => ({
        ...currentValues,
        [name]: value,
      }))
    },
    []
  )

  const fieldProps = keys(fields).reduce((result, name) => {
    result[name] = {
      ...fields[name],
      onChange: value => setValue(name, value),
      value: values[name],
      name,
    }

    return result
  }, {} as UseFormResult<T>["fieldProps"])

  const isValid = keys(fields).every(name => {
    const field = fields[name]
    const value = values[name]

    if (value === "") {
      return !field.required
    }

    if (field.type === "number") {
      if (typeof value !== "number") {
        return false
      }

      if (!Number.isInteger(value)) {
        return false
      }

      if (field.max !== undefined) {
        if (value > field.max) {
          return false
        }
      }

      if (field.min !== undefined) {
        if (value < field.min) {
          return false
        }
      }

      return true
    }

    if (typeof value !== "string") {
      return false
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
