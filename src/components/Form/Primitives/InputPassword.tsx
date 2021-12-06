import { Overwrite } from "lib/utils/objects"

import { InputBase, InputBaseProps } from "./InputBase"

export type InputPasswordProps = Overwrite<
  InputBaseProps,
  {
    autoComplete: "new-password" | "current-password"
    pattern?: RegExp
  }
>

export function InputPassword({ pattern, ...inputProps }: InputPasswordProps) {
  return (
    <InputBase
      {...inputProps}
      autoCapitalize="off"
      pattern={pattern?.source}
      type="password"
    />
  )
}
