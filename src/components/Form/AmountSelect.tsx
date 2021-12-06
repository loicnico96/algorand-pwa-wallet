import { InputAmount, InputAmountProps } from "./Primitives/InputAmount"

export interface AmountSelectProps extends InputAmountProps {
  unit?: string
}

export function AmountSelect({ unit, ...inputProps }: AmountSelectProps) {
  return (
    <div>
      <InputAmount {...inputProps} />
      {!!unit && <span>{unit}</span>}
    </div>
  )
}
