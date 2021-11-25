import { TextareaHTMLAttributes } from "react"

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

type OmitProps = "children" | "id" | "onChange" | "value"

export interface InputTextAreaProps extends Omit<TextAreaProps, OmitProps> {
  onChange: (value: string) => void
  name: string
  value: string
}

export function InputTextArea({
  name,
  onBlur,
  onChange,
  required,
  value,
  ...props
}: InputTextAreaProps) {
  return (
    <textarea
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
      required={required}
      {...props}
    />
  )
}
