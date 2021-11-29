import { Interactive, InteractiveProps } from "./Interactive"

export interface ButtonProps extends InteractiveProps {
  label: string
}

export function Button({ type = "button", ...props }: ButtonProps) {
  return <Interactive {...props} type={type} />
}
