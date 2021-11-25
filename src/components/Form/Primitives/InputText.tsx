import { InputBase, InputBaseProps } from "./InputBase"

export type InputTextProps = Omit<InputBaseProps, "type">

export function InputText(props: InputTextProps) {
  return <InputBase {...props} type="text" />
}
