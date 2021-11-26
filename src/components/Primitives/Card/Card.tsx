import styled from "@emotion/styled"

import { DivProps } from "components/Form/Primitives/InputGroup"
import { Link } from "components/Link"

const CardContainer = styled.div`
  background-color: #ccc;
  border: 2px solid #444;
  border-radius: 1em;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5em 1em;
`

export interface CardProps extends DivProps {
  href?: string
}

export function Card({ href, title, ...props }: CardProps) {
  if (href) {
    return (
      <li title={title}>
        <Link href={href}>
          <CardContainer {...props} />
        </Link>
      </li>
    )
  }

  return (
    <li title={title}>
      <CardContainer {...props} />
    </li>
  )
}
