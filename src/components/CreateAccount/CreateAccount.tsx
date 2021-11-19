import { AsyncButton } from "components/AsyncButton"

export interface CreateAccountProps {
  onBack: () => unknown
  onNext: () => unknown
}

export function CreateAccount({ onBack, onNext }: CreateAccountProps) {
  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        This wizard will help you create a new empty account on the blockchain.
      </p>
      <AsyncButton label="Start" onClick={onNext} />
    </div>
  )
}
