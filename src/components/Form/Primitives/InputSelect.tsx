import { ReactNode, SelectHTMLAttributes } from "react"

import { Overwrite } from "lib/utils/objects"

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export type InputSelectProps = Overwrite<
  SelectProps,
  {
    children: ReactNode
    label?: string
    name: string
    onChange?: (value: string) => void
    value: string
  }
>

export function InputSelect({
  disabled = false,
  id,
  label,
  onChange,
  ...selectProps
}: InputSelectProps) {
  const { name, required } = selectProps

  return (
    <select
      {...selectProps}
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
