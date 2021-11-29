import { InputBase, InputBaseProps } from "./InputBase"

export type InputAmountProps = Omit<InputBaseProps, "type">

export function InputAmount(props: InputAmountProps) {
  return <InputBase {...props} type="number" />
}
