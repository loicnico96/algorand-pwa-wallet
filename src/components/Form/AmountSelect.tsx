import { useState } from "react"

import { printDecimals, readDecimals } from "lib/utils/int"

export interface AmountSelectProps {
  decimals: number
  disabled?: boolean
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
  onChange,
  value,
  ...inputProps
}: AmountSelectProps) {
  const [inputValue, setInputValue] = useState(printDecimals(value, decimals))

  return (
    <div>
      <input
        disabled={disabled}
        min={0}
        onBlur={() => setInputValue(printDecimals(value, decimals))}
        onFocus={e => e.target.select()}
        onChange={e => {
          setInputValue(e.target.value)
          onChange(readDecimals(e.target.value, decimals))
        }}
        step={1}
        type="number"
        value={inputValue}
        {...inputProps}
      />
      {!!unit && <span>{unit}</span>}
      {max !== undefined && (
        <button
          disabled={disabled || value === max}
          onClick={() => {
            setInputValue(printDecimals(max, decimals))
            onChange(max)
          }}
        >
          Max
        </button>
      )}
    </div>
  )
}
