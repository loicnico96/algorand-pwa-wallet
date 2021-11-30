import { TextareaHTMLAttributes } from "react"

import { Overwrite } from "lib/utils/objects"

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export type InputTextAreaProps = Overwrite<
  TextAreaProps,
  {
    label?: string
    name: string
    onChange?: (value: string) => void
    value: string
  }
>

export function InputTextArea({
  disabled = false,
  id,
  label,
  onChange,
  ...inputProps
}: InputTextAreaProps) {
  const { name, required } = inputProps

  return (
    <textarea
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
    />
  )
}
