import { useEffect, useState } from "react"

import { printDecimals, readDecimals } from "lib/utils/int"

export interface AmountSelectProps {
  decimals: number
  disabled?: boolean
  min?: number
  max?: number
  onChange: (amount: number) => unknown
  unit?: string
  value: number
}

export function AmountSelect({
  decimals,
  disabled = false,
  unit,
  max,
  min,
  onChange,
  value,
  ...inputProps
}: AmountSelectProps) {
  const [inputValue, setInputValue] = useState(printDecimals(value, decimals))

  useEffect(() => {
    setInputValue(printDecimals(value, decimals))
  }, [value, setInputValue, decimals])

  return (
    <div>
      <input
        disabled={disabled}
        min={0}
        onBlur={e => {
          onChange(readDecimals(e.target.value, decimals))
        }}
        onFocus={e => {
          e.target.select()
        }}
        onChange={e => {
          setInputValue(e.target.value)
        }}
        step={1}
        type="number"
        value={inputValue}
        {...inputProps}
      />
      {!!unit && <span>{unit}</span>}
      {max !== undefined && (
        <button
          disabled={disabled}
          onClick={() => {
            if (value !== max) {
              onChange(max)
            }
          }}
        >
          Max
        </button>
      )}
    </div>
  )
}
