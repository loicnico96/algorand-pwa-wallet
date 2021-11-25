import { ReactNode } from "react"

import { DivProps } from "./InputGroup"

export interface GroupLabelProps extends DivProps {
  children: ReactNode
  group: string
}

export function GroupLabel({ group, ...props }: GroupLabelProps) {
  return <h4 id={`label-group-${group}`} {...props} />
}
