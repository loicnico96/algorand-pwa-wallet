import { ReactNode } from "react"

export interface InputLabelProps {
  children: ReactNode
  name: string
}

export function InputLabel({ children, name }: InputLabelProps) {
  return <label htmlFor={`input-${name}`}>{children}</label>
}
