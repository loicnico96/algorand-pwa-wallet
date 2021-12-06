import { useEffect, useState } from "react"

import { Overwrite } from "lib/utils/objects"

import { InputBase, InputBaseProps } from "./InputBase"

export type InputNumberProps = Overwrite<
  InputBaseProps,
  {
    decimals: number
    max?: number
    min?: number
    onChange?: (value: number) => void
    value: number
  }
>

export function InputNumber({
  autoSelect = true,
  decimals,
  onBlur,
  onChange,
  onKeyDown,
  value,
  ...props
}: InputNumberProps) {
  const step = 1 / 10 ** decimals

  const [inputValue, setInputValue] = useState(value.toFixed(decimals))

  useEffect(() => {
    if (value !== Number.parseFloat(inputValue)) {
      setInputValue(value.toFixed(decimals))
    }
  }, [inputValue, value, decimals])

  return (
    <InputBase
      {...props}
      autoSelect={autoSelect}
      onBlur={e => {
        setInputValue(value.toFixed(decimals))

        if (onBlur) {
          onBlur(e)
        }
      }}
      onChange={newInputValue => {
        setInputValue(newInputValue)

        if (onChange) {
          const newValue = Number.parseFloat(newInputValue)
          if (value !== newValue) {
            onChange(newValue)
          }
        }
      }}
      onKeyDown={e => {
        if (e.key === "Enter") {
          setInputValue(value.toFixed(decimals))
        }

        if (onKeyDown) {
          onKeyDown(e)
        }
      }}
      step={step}
      type="number"
      value={inputValue}
    />
  )
}
