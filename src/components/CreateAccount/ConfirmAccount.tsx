import { AsyncButton } from "components/AsyncButton"
import { Address } from "lib/algo/Account"
import { toClipboard } from "lib/utils/clipboard"

export interface ConfirmAccountProps {
  address: Address
  onBack: () => unknown
  onNext: () => unknown
}

export function ConfirmAccount({
  address,
  onBack,
  onNext,
}: ConfirmAccountProps) {
  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Your account is now setup. To send transactions on the blockchain, you
        must hold at least 0.1 Algos. You can fund your account by sending Algos
        to this address:
      </p>
      <p>{address}</p>
      <AsyncButton
        label="Copy to clipboard"
        onClick={() => toClipboard(address)}
      />
      <AsyncButton label="Confirm" onClick={onNext} />
    </div>
  )
}