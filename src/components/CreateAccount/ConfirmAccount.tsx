import Link from "next/link"

import { Address } from "lib/algo/Account"
import { toClipboard } from "lib/utils/clipboard"

export interface ConfirmAccountProps {
  address: Address
  onBack: string | (() => unknown)
  onNext: string | (() => unknown)
}

export function ConfirmAccount({
  address,
  onBack,
  onNext,
}: ConfirmAccountProps) {
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
        Your account is now setup. To send transactions on the blockchain, you
        must hold at least 0.1 Algos. You can fund your account by sending Algos
        to this address:
      </p>
      <p>{address}</p>
      <button onClick={() => toClipboard(address)}>Copy to clipboard</button>
      {typeof onNext === "string" ? (
        <Link href={onNext}>
          <a>Confirm</a>
        </Link>
      ) : (
        <a onClick={onNext}>Confirm</a>
      )}
    </div>
  )
}
