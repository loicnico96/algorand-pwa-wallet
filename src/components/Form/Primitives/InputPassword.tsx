import { InputBase, InputBaseProps } from "./InputBase"

export type InputPasswordProps = Omit<InputBaseProps, "type">

export function InputPassword(props: InputPasswordProps) {
  return <InputBase {...props} autoComplete="off" type="password" />
}
