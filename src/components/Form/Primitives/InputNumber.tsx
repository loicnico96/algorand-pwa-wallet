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

export function isEqual(a: number, b: number, e: number): boolean {
  return Math.abs(a - b) < e
}

export function toString(value: number, decimals: number): string {
  return value.toFixed(decimals)
}

export function toNumber(value: string, decimals: number): number {
  return Number.parseFloat(toString(Number.parseFloat(value), decimals))
}

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

  const [inputValue, setInputValue] = useState(toString(value, decimals))

  useEffect(() => {
    if (!isEqual(value, toNumber(inputValue, decimals), step / 2)) {
      setInputValue(toString(value, decimals))
    }
  }, [decimals, inputValue, step, value])

  return (
    <InputBase
      {...props}
      autoSelect={autoSelect}
      onBlur={e => {
        setInputValue(toString(value, decimals))

        if (onBlur) {
          onBlur(e)
        }
      }}
      onChange={newInputValue => {
        setInputValue(newInputValue)

        if (onChange) {
          const newValue = toNumber(newInputValue, decimals)
          if (!isEqual(value, newValue, step / 2)) {
            onChange(newValue)
          }
        }
      }}
      onKeyDown={e => {
        if (e.key === "Enter") {
          setInputValue(toString(value, decimals))
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
