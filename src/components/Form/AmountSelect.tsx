import { useEffect, useState } from "react"

import { Button } from "components/Primitives/Button"
import { printDecimals, readDecimals } from "lib/utils/int"

import { InputBase } from "./Primitives/InputBase"

export interface AmountSelectProps {
  decimals: number
  disabled?: boolean
  min?: number
  max?: number
  name: string
  onChange?: (amount: number) => void
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
  }, [value, decimals])

  return (
    <div>
      <InputBase
        {...inputProps}
        autoSelect
        disabled={disabled}
        min={0}
        max={max !== undefined ? max / 10 ** decimals : undefined}
        name={name}
        onBlur={
          onChange
            ? event => onChange(readDecimals(event.target.value, decimals))
            : undefined
        }
        onChange={setInputValue}
        step={1 / 10 ** decimals}
        type="number"
        value={inputValue}
      />
      {!!unit && <span>{unit}</span>}
      {onChange !== undefined && max !== undefined && (
        <Button
          label="Max"
          disabled={disabled}
          onClick={() => onChange(max)}
          title="Set maximum amount"
        />
      )}
    </div>
  )
}
