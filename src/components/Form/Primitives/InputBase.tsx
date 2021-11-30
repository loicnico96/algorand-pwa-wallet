import { InputHTMLAttributes } from "react"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

type OmitProps = "id" | "onChange" | "onKeyPress" | "pattern"

export interface InputBaseProps extends Omit<InputProps, OmitProps> {
  allowKeys?: string | RegExp
  autoSelect?: boolean
  onChange?: (value: string) => void
  label?: string
  pattern?: string | RegExp
  name: string
}

export function InputBase({
  allowKeys,
  autoSelect,
  disabled,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  onKeyDown,
  pattern,
  required,
  ...props
}: InputBaseProps) {
  return (
    <input
      aria-label={label}
      aria-required={required ? "true" : undefined}
      disabled={disabled ?? !onChange}
      id={`input-${name}`}
      name={name}
      onBlur={e => {
        if (onChange) {
          onChange(e.currentTarget.value.trim())
        }

        if (onBlur) {
          onBlur(e)
        }
      }}
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
      onKeyDown={e => {
        if (allowKeys && e.key !== "Enter" && !e.key.match(allowKeys)) {
          e.preventDefault()
        }

        if (onKeyDown) {
          onKeyDown(e)
        }
      }}
      pattern={pattern instanceof RegExp ? pattern.source : pattern}
      required={required}
      {...props}
    />
  )
}
