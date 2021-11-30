import { FocusEvent, InputHTMLAttributes, KeyboardEvent } from "react"

import { Overwrite } from "lib/utils/objects"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export interface InputBaseProps {
  autoFocus?: boolean
  autoSelect?: boolean
  disabled?: boolean
  label?: string
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onKeyUp?: (event: KeyboardEvent<HTMLInputElement>) => void
  name: string
  required?: boolean
}

export function InputBase({
  autoSelect = false,
  disabled = false,
  label,
  onFocus,
  ...inputProps
}: Overwrite<InputProps, InputBaseProps>) {
  const { name, onChange, required } = inputProps

  return (
    <input
      {...inputProps}
      aria-label={label}
      aria-required={required ? "true" : undefined}
      disabled={disabled || !onChange}
      id={`input-${name}`}
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
