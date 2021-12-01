import { InputNumber, InputNumberProps } from "./Primitives/InputNumber"

export interface AmountSelectProps extends InputNumberProps {
  unit?: string
}

export function AmountSelect({ unit, ...inputProps }: AmountSelectProps) {
  return (
    <div>
      <InputNumber {...inputProps} />
      {!!unit && <span>{unit}</span>}
    </div>
  )
}
