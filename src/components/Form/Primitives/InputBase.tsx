import { InputHTMLAttributes } from "react"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

type OmitProps = "id" | "onChange" | "pattern"

export interface InputBaseProps extends Omit<InputProps, OmitProps> {
  autoSelect?: boolean
  onChange: (value: string) => void
  pattern?: string | RegExp
  name: string
}

export function InputBase({
  autoSelect,
  name,
  onBlur,
  onChange,
  onFocus,
  pattern,
  required,
  ...props
}: InputBaseProps) {
  return (
    <input
      aria-required={required ? "true" : undefined}
      id={`input-${name}`}
      name={name}
      onBlur={e => {
        onChange(e.currentTarget.value.trim())

        if (onBlur) {
          onBlur(e)
        }
      }}
      onChange={e => {
        onChange(e.currentTarget.value)
      }}
      onFocus={e => {
        if (autoSelect) {
          e.currentTarget.select()
        }

        if (onFocus) {
          onFocus(e)
        }
      }}
      pattern={pattern instanceof RegExp ? pattern.source : pattern}
      required={required}
      {...props}
    />
  )
}
