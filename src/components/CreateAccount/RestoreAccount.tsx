import { AsyncButton } from "components/AsyncButton"

export interface RestoreAccountProps {
  onBack: () => Promise<void>
  onNext: () => Promise<void>
}

export function RestoreAccount({ onBack, onNext }: RestoreAccountProps) {
  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        This wizard will help you restore an existing account via your
        passphrase.
      </p>
      <AsyncButton autoFocus id="submit" label="Start" onClick={onNext} />
    </div>
  )
}
