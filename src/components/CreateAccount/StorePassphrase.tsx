import { AsyncButton } from "components/AsyncButton"

import { Passphrase } from "./Passphrase"

export interface StorePassphraseProps {
  onBack: () => unknown
  onNext: () => unknown
  passphrase: string[]
}

export function StorePassphrase({
  onBack,
  onNext,
  passphrase,
}: StorePassphraseProps) {
  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        This is your secret passphrase of 25 words. Write it down carefully
        (order matters), store it somewhere safe, and never share it with
        anyone. It will be required to restore your account from another device.
      </p>
      <Passphrase words={passphrase} />
      <AsyncButton label="Confirm" onClick={onNext} />
    </div>
  )
}
