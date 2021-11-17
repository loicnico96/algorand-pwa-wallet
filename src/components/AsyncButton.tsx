import { ButtonHTMLAttributes, ReactElement } from "react"

import { useAsyncHandler } from "hooks/useAsyncHandler"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export interface AsyncButtonProps
  extends Omit<ButtonProps, "children" | "onError"> {
  label: ReactElement
  labelLoading?: ReactElement
  onClick: () => Promise<unknown>
  onError?: (error: Error) => void
}

export function AsyncButton({
  disabled = false,
  label,
  labelLoading,
  onClick,
  onError,
  ...props
}: AsyncButtonProps) {
  const [onClickAsync, loading] = useAsyncHandler(onClick, onError)

  return (
    <button disabled={disabled || loading} onClick={onClickAsync} {...props}>
      {loading ? labelLoading ?? label : label}
    </button>
  )
}
