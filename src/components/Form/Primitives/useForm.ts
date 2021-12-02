import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { useCallback, useEffect, useRef, useState } from "react"

import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { handleGenericError } from "lib/utils/error"
import { defaultLogger } from "lib/utils/logger"
export interface FieldOptionsBase {
  query?: string
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
  [K in keyof T]: FieldValue<T[K]>
}

export type FieldProps<T extends FieldOptions> = T & {
  onChange: (value: FieldValue<T>) => void
  name: string
  value: FieldValue<T>
}

export interface UseFormOptions<T extends Record<string, FieldOptions>> {
  fields: T
  defaultValues: FieldValues<T>
  onError?: (error: Error) => void
  onSubmit: (values: FieldValues<T>) => Promise<void>
}

export interface UseFormResult<T extends Record<string, FieldOptions>> {
  fieldProps: {
    [K in keyof T]: FieldProps<T[K]>
  }
  isSubmitting: boolean
  isValid: boolean
  mergeValues: (values: Partial<FieldValues<T>>) => void
  resetForm: () => void
  setValue: <K extends keyof T>(name: K, value: FieldValue<T[K]>) => void
  setValues: (values: FieldValues<T>) => void
  submitForm: () => void
  values: FieldValues<T>
}

export function castToField<T extends FieldOptions>(
  field: T,
  value: string
): FieldValue<T> {
  if (field.type === "number") {
    return Number.parseInt(value, 10) as FieldValue<T & { type: "number" }>
  } else {
    return value as FieldValue<T & { type: "string" }>
  }
}

export function isValidField<T extends FieldOptions>(
  field: T,
  value: FieldValue<T>
): boolean {
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
}

export function getQueryString<T extends Record<string, FieldOptions>>(
  fields: T,
  defaultValues: FieldValues<T>,
  values: FieldValues<T>
): string {
  const params = new URLSearchParams(window.location.search)

  for (const name in fields) {
    const field = fields[name]
    const value = values[name]
    if (field.query) {
      if (value !== undefined && value !== defaultValues[name]) {
        params.set(field.query, String(value))
      } else {
        params.delete(field.query)
      }
    }
  }

  return params.toString()
}

export function getQueryValues<T extends Record<string, FieldOptions>>(
  fields: T,
  defaultValues: FieldValues<T>,
  query: ParsedUrlQuery
): FieldValues<T> {
  const values = { ...defaultValues }

  for (const name in fields) {
    const field = fields[name]
    if (field.query) {
      const param = query[field.query]
      if (param) {
        const value = Array.isArray(param) ? param[0] : param
        const valueCast = castToField(field, value)
        if (isValidField(field, valueCast)) {
          values[name] = valueCast
        }
      }
    }
  }

  return values
}

export function useForm<T extends Record<string, FieldOptions>>({
  fields,
  defaultValues,
  onError = handleGenericError,
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  const router = useRouter()
  const loadQueryRef = useRef(!router.isReady)

  const [values, setValues] = useState(() =>
    router.isReady
      ? getQueryValues(fields, defaultValues, router.query)
      : defaultValues
  )

  useEffect(() => {
    if (router.isReady) {
      if (loadQueryRef.current) {
        loadQueryRef.current = false
        setValues(getQueryValues(fields, defaultValues, router.query))
      } else {
        const query = getQueryString(fields, defaultValues, values)
        if (query !== window.location.search.slice(1)) {
          router.replace({ query }, undefined, { shallow: true }).catch(e => {
            defaultLogger.error(e)
          })
        }
      }
    }
  }, [defaultValues, fields, values, router])

  const mergeValues = useCallback((newValues: Partial<FieldValues<T>>) => {
    setValues(currentValues => ({
      ...currentValues,
      ...newValues,
    }))
  }, [])

  const setValue = useCallback(
    <K extends keyof T>(name: K, value: FieldValue<T[K]>) => {
      mergeValues({ [name]: value } as Partial<FieldValues<T>>)
    },
    [mergeValues]
  )

  let isValid = true

  const fieldProps = {} as UseFormResult<T>["fieldProps"]

  for (const name in fields) {
    fieldProps[name] = {
      ...fields[name],
      onChange: value => setValue(name, value),
      value: values[name],
      name,
    }

    if (!isValidField(fields[name], values[name])) {
      isValid = false
    }
  }

  const [submitForm, isSubmitting] = useAsyncHandler(
    useCallback(async () => {
      if (isValid) {
        await onSubmit(values)
      }
    }, [isValid, onSubmit, values]),
    onError
  )

  const resetForm = useCallback(() => {
    setValues(defaultValues)
  }, [defaultValues])

  return {
    fieldProps,
    isSubmitting,
    isValid,
    mergeValues,
    resetForm,
    setValue,
    setValues,
    submitForm,
    values,
  }
}
