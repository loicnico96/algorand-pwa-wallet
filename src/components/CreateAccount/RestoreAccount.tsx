import { AsyncButton } from "components/AsyncButton"

export interface RestoreAccountProps {
  onBack: () => unknown
  onNext: () => unknown
}

export function RestoreAccount({ onBack, onNext }: RestoreAccountProps) {
  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        This wizard will help you restore an existing account via your
        passphrase.
      </p>
      <AsyncButton label="Start" onClick={onNext} />
    </div>
  )
}
