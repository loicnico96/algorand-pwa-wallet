import { Overwrite } from "lib/utils/objects"

import { InputBase, InputBaseProps } from "./InputBase"

export type InputTextProps = Overwrite<
  InputBaseProps,
  {
    autoCapitalize?: "off"
    autoComplete?: "off" | "username"
    pattern?: RegExp
    placeholder?: string
  }
>

export function InputText({ pattern, ...props }: InputTextProps) {
  return <InputBase {...props} pattern={pattern?.source} type="text" />
}
