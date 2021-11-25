import { ButtonHTMLAttributes } from "react"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

type OmitProps = "children" | "type"

export interface FormSubmitProps extends Omit<ButtonProps, OmitProps> {
  label: string
}

export function FormSubmit({ label, ...props }: FormSubmitProps) {
  return (
    <button id="submit" title={label} type="submit" {...props}>
      {label}
    </button>
  )
}
