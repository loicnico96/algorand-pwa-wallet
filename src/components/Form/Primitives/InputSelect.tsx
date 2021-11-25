import { ReactNode, SelectHTMLAttributes } from "react"

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

type OmitProps = "defaultValue" | "onChange"

export interface InputSelectProps extends Omit<SelectProps, OmitProps> {
  children: ReactNode
  label?: string
  name: string
  onChange?: (value: string) => void
  value: string
}

export function InputSelect({
  disabled,
  label,
  name,
  onChange,
  required,
  ...props
}: InputSelectProps) {
  return (
    <select
      aria-label={label}
      aria-required={required ? "true" : undefined}
      disabled={disabled ?? !onChange}
      id={`input-${name}`}
      name={name}
      onChange={e => {
        if (onChange) {
          onChange(e.currentTarget.value)
        }
      }}
      required={required}
      {...props}
    />
  )
}
