import { LabelHTMLAttributes, ReactNode } from "react"

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

type OmitProps = "htmlFor"

export interface InputLabelProps extends Omit<LabelProps, OmitProps> {
  children: ReactNode
  name: string
}

export function InputLabel({ name, ...props }: InputLabelProps) {
  return <label htmlFor={`input-${name}`} {...props} />
}
