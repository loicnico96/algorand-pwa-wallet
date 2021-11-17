import Link from "next/link"
import { useCallback, useState } from "react"

import { PIN_REGEX } from "lib/utils/auth"

export interface ChoosePinProps {
  onBack: string | (() => unknown)
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
      {typeof onBack === "string" ? (
        <Link href={onBack}>
          <a>Back</a>
        </Link>
      ) : (
        <a onClick={onBack}>Back</a>
      )}
      <p>
        Choose your secret PIN (6 digits). It will be required to confirm
        transactions.
      </p>
      <input
        onChange={e => setPin(e.target.value)}
        type="password"
        value={pin}
      />
      <button disabled={!isValidPin} onClick={onConfirm}>
        Confirm
      </button>
    </div>
  )
}
