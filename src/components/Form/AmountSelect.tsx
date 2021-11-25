import { useEffect, useState } from "react"

import { printDecimals, readDecimals } from "lib/utils/int"

import { InputBase } from "./Primitives/InputBase"

export interface AmountSelectProps {
  decimals: number
  disabled?: boolean
  min?: number
  max?: number
  name: string
  onChange: (amount: number) => void
  unit?: string
  value: number
}

export function AmountSelect({
  decimals,
  disabled,
  unit,
  max,
  min,
  name,
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
      <InputBase
        autoFocus
        disabled={disabled}
        min={0}
        max={max !== undefined ? max / 10 ** decimals : undefined}
        name={name}
        onBlur={e => onChange(readDecimals(e.target.value, decimals))}
        onChange={setInputValue}
        step={1 / 10 ** decimals}
        type="number"
        value={inputValue}
        {...inputProps}
      />
      {!!unit && <span>{unit}</span>}
      {max !== undefined && (
        <button
          aria-label="Max"
          disabled={disabled}
          name={`${name}-max`}
          id={`input-${name}-max`}
          onClick={() => onChange(max)}
          title="Set maximum amount"
        >
          Max
        </button>
      )}
    </div>
  )
}
