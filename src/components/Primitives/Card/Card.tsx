import styled from "@emotion/styled"
import { useEffect } from "react"

import { DivProps } from "components/Form/Primitives/InputGroup"
import { Link } from "components/Link"
import { defaultLogger } from "lib/utils/logger"

const CardContainer = styled.div`
  background-color: #ccc;
  border: 2px solid #444;
  border-radius: 1em;
  cursor: ${props => (props.onClick ? "pointer" : "default")};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5em 1em;
`

export interface CardProps extends DivProps {
  disabled?: boolean
  href?: string
}

export function Card({ href, disabled, onClick, ...props }: CardProps) {
  useEffect(() => {
    if (href && onClick) {
      defaultLogger.warn("Cannot pass both 'href' and 'onClick' props to Card.")
    }
  }, [href, onClick])

  if (href && !onClick) {
    return (
      <Link href={href}>
        <CardContainer {...props} />
      </Link>
    )
  }

  return <CardContainer onClick={disabled ? undefined : onClick} {...props} />
}
