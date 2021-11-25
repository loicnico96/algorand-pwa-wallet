import { HTMLAttributes, ReactNode } from "react"

export type DivProps = HTMLAttributes<HTMLDivElement>

export interface InputGroupProps extends DivProps {
  children: ReactNode
  group: string
}

export function InputGroup({ group, ...props }: InputGroupProps) {
  return (
    <div
      {...props}
      aria-labelledby={`label-group-${group}`}
      id={`group-${group}`}
      role="group"
    />
  )
}
