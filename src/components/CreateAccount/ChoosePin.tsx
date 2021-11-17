import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { PIN_REGEX } from "lib/utils/auth"

export interface ChoosePinProps {
  onBack: () => unknown
  onNext: (pin: string) => unknown
}

export function ChoosePin({ onBack, onNext }: ChoosePinProps) {
  const [pin, setPin] = useState("")

  const isValidPin = pin.match(PIN_REGEX)

  const onConfirm = useCallback(() => {
    if (isValidPin) {
      onNext(pin)
    }
  }, [isValidPin, onNext, pin])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose your secret PIN (6 digits). It will be required to confirm
        transactions.
      </p>
      <input
        onChange={e => setPin(e.target.value)}
        type="password"
        value={pin}
      />
      <AsyncButton disabled={!isValidPin} label="Confirm" onClick={onConfirm} />
    </div>
  )
}
