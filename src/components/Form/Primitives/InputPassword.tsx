import { Overwrite } from "lib/utils/objects"

import { InputBase, InputBaseProps } from "./InputBase"

export type InputPasswordProps = Overwrite<
  InputBaseProps,
  {
    autoComplete: "new-password" | "current-password"
    pattern?: RegExp
  }
>

export function InputPassword({
  onKeyDown,
  pattern,
  ...inputProps
}: InputPasswordProps) {
  return (
    <InputBase
      {...inputProps}
      autoCapitalize="off"
      onKeyDown={e => {
        if (!e.key.match(/^[0-9]$/)) {
          e.preventDefault()
        }

        if (onKeyDown) {
          onKeyDown(e)
        }
      }}
      pattern={pattern?.source}
      type="password"
    />
  )
}
