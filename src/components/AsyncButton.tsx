import styled from "@emotion/styled"
import { ButtonHTMLAttributes } from "react"

import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { handleGenericError } from "lib/utils/error"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

type OmitProps = "children" | "onError"

export interface AsyncButtonProps extends Omit<ButtonProps, OmitProps> {
  label: string
  labelLoading?: string
  onClick: () => unknown
  onError?: (error: Error) => void
}

const Button = styled.button`
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
`

export function AsyncButton({
  disabled = false,
  label,
  labelLoading = label,
  onClick,
  onError = handleGenericError,
  ...props
}: AsyncButtonProps) {
  const [onClickAsync, loading] = useAsyncHandler(onClick, onError)

  return (
    <Button
      disabled={disabled || loading}
      onClick={e => {
        e.preventDefault()
        onClickAsync()
      }}
      type="button"
      {...props}
    >
      {loading ? labelLoading : label}
    </Button>
  )
}
