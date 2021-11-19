import { ButtonHTMLAttributes, ReactNode } from "react"

import { useAsyncHandler } from "hooks/useAsyncHandler"
import { createLogger } from "lib/utils/logger"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export interface AsyncButtonProps
  extends Omit<ButtonProps, "children" | "onError"> {
  label: ReactNode
  labelLoading?: ReactNode
  onClick: () => unknown
  onError?: (error: Error) => void
}

const logger = createLogger("AsyncButton")

export function AsyncButton({
  disabled = false,
  label,
  labelLoading,
  onClick,
  onError = logger.error,
  ...props
}: AsyncButtonProps) {
  const [onClickAsync, loading] = useAsyncHandler(onClick, onError)

  return (
    <button disabled={disabled || loading} onClick={onClickAsync} {...props}>
      {loading ? labelLoading ?? label : label}
    </button>
  )
}
