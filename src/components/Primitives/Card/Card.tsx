import styled from "@emotion/styled"
import { useCallback } from "react"

import { DivProps } from "components/Form/Primitives/InputGroup"
import { Link } from "components/Link"
import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { handleGenericError } from "lib/utils/error"

const CardContainer = styled.div<{ disabled?: boolean; loading?: boolean }>`
  background-color: #ccc;
  border: 2px solid #444;
  border-radius: 1em;
  cursor: ${props =>
    props.onClick
      ? props.disabled
        ? "not-allowed"
        : props.loading
        ? "progress"
        : "pointer"
      : "default"};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5em 1em;
`

export interface CardProps extends Omit<DivProps, "onClick" | "onError"> {
  disabled?: boolean
  href?: string
  onClick?: () => Promise<void>
  onError?: (error: Error) => void
}

export function Card({
  href,
  disabled,
  onClick,
  onError = handleGenericError,
  ...props
}: CardProps) {
  const [onClickAsync, loading] = useAsyncHandler(
    useCallback(async () => {
      if (onClick && !disabled) {
        await onClick()
      }
    }, [disabled, onClick]),
    onError
  )

  if (href && !onClick) {
    return (
      <Link href={href}>
        <CardContainer {...props} />
      </Link>
    )
  }

  return (
    <CardContainer
      disabled={disabled}
      loading={loading}
      onClick={onClick ? onClickAsync : undefined}
      {...props}
    />
  )
}
