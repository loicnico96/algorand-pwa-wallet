import { useEffect, useState } from "react"

import { printDecimals, readDecimals } from "lib/utils/int"
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
  min,
  max,
  onBlur,
  onChange,
  onKeyDown,
  value,
  ...props
}: InputNumberProps) {
  const step = 1 / 10 ** decimals

  const [inputValue, setInputValue] = useState(printDecimals(value, decimals))

  useEffect(() => {
    if (value !== readDecimals(inputValue, decimals)) {
      setInputValue(printDecimals(value, decimals))
    }
  }, [inputValue, value, decimals])

  return (
    <InputBase
      {...props}
      autoSelect={autoSelect}
      max={max !== undefined ? max * step : undefined}
      min={min !== undefined ? min * step : undefined}
      onBlur={e => {
        setInputValue(printDecimals(value, decimals))

        if (onBlur) {
          onBlur(e)
        }
      }}
      onChange={e => {
        setInputValue(e.currentTarget.value)

        if (onChange) {
          const newValue = readDecimals(e.currentTarget.value, decimals)
          if (value !== newValue) {
            onChange(newValue)
          }
        }
      }}
      onKeyDown={e => {
        if (e.key === "Enter") {
          setInputValue(printDecimals(value, decimals))
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
