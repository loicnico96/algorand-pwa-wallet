import { Overwrite } from "lib/utils/objects"

import { InputBase, InputBaseProps } from "./InputBase"

export type InputTextProps = Overwrite<
  InputBaseProps,
  {
    autoCapitalize?: "off"
    autoComplete?: "off" | "current-password" | "new-password" | "username"
    onChange?: (value: string) => void
    pattern?: RegExp
    placeholder?: string
    type?: "text" | "password"
    value?: string
  }
>

export function InputText({
  onChange,
  pattern,
  type = "text",
  ...props
}: InputTextProps) {
  return (
    <InputBase
      {...props}
      onChange={e => {
        if (onChange) {
          onChange(e.currentTarget.value)
        }
      }}
      pattern={pattern?.source}
      type={type}
    />
  )
}
