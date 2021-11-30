import { Button } from "components/Primitives/Button"

import { InputNumber, InputNumberProps } from "./Primitives/InputNumber"

export interface AmountSelectProps extends InputNumberProps {
  unit?: string
}

export function AmountSelect({ unit, ...inputProps }: AmountSelectProps) {
  const { disabled, max, onChange } = inputProps

  return (
    <div>
      <InputNumber {...inputProps} />
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
