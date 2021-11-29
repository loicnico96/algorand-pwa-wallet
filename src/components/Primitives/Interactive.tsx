import styled from "@emotion/styled"
import { HTMLAttributes, MouseEvent, useEffect, useRef } from "react"

import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { handleGenericError } from "lib/utils/error"

import { Link } from "./Link"

type BaseInteractiveProps = Omit<HTMLAttributes<HTMLElement>, "onError">

export interface InteractiveProps extends BaseInteractiveProps {
  autoFocus?: boolean
  disabled?: boolean
  href?: string
  label?: string
  onClick?: (event: MouseEvent<HTMLElement>) => unknown
  onError?: (error: Error) => void
  type?: "button" | "reset" | "submit"
}

const InteractiveContainer = styled.div<InteractiveProps>`
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
`

export function Interactive({
  autoFocus,
  children,
  disabled = false,
  href,
  label,
  onClick,
  onError = handleGenericError,
  onKeyUp,
  title,
  type,
  ...props
}: InteractiveProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  const [onClickAsync, isRunning] = useAsyncHandler(
    async (event: MouseEvent<HTMLElement>) => {
      if (onClick && !disabled) {
        await onClick(event)
      }
    },
    onError
  )

  useEffect(() => {
    // Handle autofocus for elements that don't support it natively
    if (ref.current && autoFocus) {
      ref.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (href !== undefined) {
    if (type !== undefined) {
      return (
        // Disable focus on the wrapping link, as button is already focusable
        <Link href={href} tabIndex={-1}>
          <InteractiveContainer
            {...props}
            aria-label={label}
            as="button"
            autoFocus={autoFocus}
            disabled={disabled || isRunning}
            onClick={onClickAsync}
            onKeyUp={onKeyUp}
            title={title ?? label}
            type={type}
          >
            {children ?? label}
          </InteractiveContainer>
        </Link>
      )
    }

    return (
      <InteractiveContainer
        {...props}
        aria-label={label}
        as={Link}
        disabled={disabled || isRunning}
        href={href}
        onClick={onClickAsync}
        onKeyUp={onKeyUp}
        ref={ref}
        title={title ?? label}
      >
        {children ?? label}
      </InteractiveContainer>
    )
  }

  if (type !== undefined) {
    return (
      <InteractiveContainer
        {...props}
        aria-label={label}
        as="button"
        autoFocus={autoFocus}
        disabled={disabled || isRunning}
        onClick={onClickAsync}
        onKeyUp={onKeyUp}
        title={title ?? label}
        type={type}
      >
        {children ?? label}
      </InteractiveContainer>
    )
  }

  return (
    <InteractiveContainer
      {...props}
      aria-label={label}
      disabled={disabled || isRunning}
      onClick={onClickAsync}
      onKeyUp={event => {
        if (onKeyUp) {
          onKeyUp(event)
        }

        if (event.isDefaultPrevented()) {
          return
        }

        // Handle keyboard events for elements that don't support it natively
        if (event.key === "Enter" || event.key === " ") {
          event.currentTarget.click()
        }
      }}
      ref={ref}
      role="button"
      tabIndex={disabled ? undefined : 0}
      title={title ?? label}
    >
      {children}
    </InteractiveContainer>
  )
}
