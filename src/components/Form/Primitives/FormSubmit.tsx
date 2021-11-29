import { Button, ButtonProps } from "components/Primitives/Button"

export type FormSubmitProps = Omit<ButtonProps, "type">

export function FormSubmit({ id = "submit", ...props }: FormSubmitProps) {
  return <Button {...props} id={id} type="submit" />
}
