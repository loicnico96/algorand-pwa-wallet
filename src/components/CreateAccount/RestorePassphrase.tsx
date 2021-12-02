import { Passphrase, PASSPHRASE_LENGTH } from "./Passphrase"

export interface RestorePassphraseProps {
  onBack: () => Promise<void>
  onNext: (passphrase: string[]) => Promise<void>
}

const EMPTY_PASSPHRASE = Array(PASSPHRASE_LENGTH).fill("")

export function RestorePassphrase({ onBack, onNext }: RestorePassphraseProps) {
  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Fill the {PASSPHRASE_LENGTH} words from your passphase in order. Use
        only lower case latin (a-z) characters.
      </p>
      <Passphrase
        autoFocus
        editable
        onSubmit={onNext}
        defaultValues={EMPTY_PASSPHRASE}
      />
    </div>
  )
}
