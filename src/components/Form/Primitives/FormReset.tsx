import { Button, ButtonProps } from "components/Primitives/Button"

export type FormResetProps = Omit<ButtonProps, "type">

export function FormReset({ id = "reset", ...props }: FormResetProps) {
  return <Button {...props} id={id} type="reset" />
}
