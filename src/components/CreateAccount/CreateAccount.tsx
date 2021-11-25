import { AsyncButton } from "components/AsyncButton"

export interface CreateAccountProps {
  onBack: () => Promise<void>
  onNext: () => Promise<void>
}

export function CreateAccount({ onBack, onNext }: CreateAccountProps) {
  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        This wizard will help you create a new empty account on the blockchain.
      </p>
      <AsyncButton autoFocus id="submit" label="Start" onClick={onNext} />
    </div>
  )
}
