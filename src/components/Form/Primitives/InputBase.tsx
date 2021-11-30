import { FocusEvent, InputHTMLAttributes, KeyboardEvent } from "react"

import { Overwrite } from "lib/utils/objects"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export interface InputBaseProps {
  autoFocus?: boolean
  autoSelect?: boolean
  disabled?: boolean
  id?: string
  label?: string
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onChange?: (value: string) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onKeyUp?: (event: KeyboardEvent<HTMLInputElement>) => void
  name: string
  required?: boolean
  value: string
}

export function InputBase({
  autoSelect = false,
  disabled = false,
  id,
  label,
  onChange,
  onFocus,
  ...inputProps
}: Overwrite<InputProps, InputBaseProps>) {
  const { name, required } = inputProps

  return (
    <input
      {...inputProps}
      aria-label={label}
      aria-required={required ? "true" : undefined}
      disabled={disabled || !onChange}
      id={id ?? `input-${name}`}
      onChange={e => {
        if (onChange) {
          onChange(e.currentTarget.value)
        }
      }}
      onFocus={e => {
        if (autoSelect) {
          e.currentTarget.select()
        }

        if (onFocus) {
          onFocus(e)
        }
      }}
    />
  )
}
