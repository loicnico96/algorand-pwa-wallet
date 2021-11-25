import { Passphrase, PASSPHRASE_LENGTH } from "./Passphrase"

export interface StorePassphraseProps {
  onBack: () => Promise<void>
  onNext: () => Promise<void>
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
        This is your secret passphrase. Write the {PASSPHRASE_LENGTH} words
        carefully, in order, and store them somewhere extremely safe. Never
        share your passphrase with anyone. It will be required to restore your
        account from another device.
      </p>
      <Passphrase autoFocus onSubmit={onNext} initialValues={passphrase} />
    </div>
  )
}
