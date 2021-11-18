import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { PIN_REGEX } from "lib/utils/auth"

export interface RequestPinProps {
  onBack: () => unknown
  onNext: (pin: string) => unknown
}

export function RequestPin({ onBack, onNext }: RequestPinProps) {
  const [pin, setPin] = useState("")

  const onConfirm = useCallback(async () => {
    if (pin.match(PIN_REGEX)) {
      onNext(pin)
    }
  }, [onNext, pin])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>Enter your secret PIN (6 digits).</p>
      <input
        onChange={e => setPin(e.target.value)}
        type="password"
        value={pin}
      />
      <AsyncButton
        disabled={!pin.match(PIN_REGEX)}
        label="Confirm"
        onClick={onConfirm}
      />
    </div>
  )
}
