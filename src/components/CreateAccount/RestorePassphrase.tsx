import { useState } from "react"

import { AsyncButton } from "components/AsyncButton"

import { Passphrase, PASSPHRASE_LENGTH, PASSPHRASE_REGEX } from "./Passphrase"

export interface RestorePassphraseProps {
  onBack: () => unknown
  onNext: (passphrase: string[]) => unknown
}

export function RestorePassphrase({ onBack, onNext }: RestorePassphraseProps) {
  const [words, setWords] = useState(Array(PASSPHRASE_LENGTH).fill(""))

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>Fill your passphrase (order matters).</p>
      <Passphrase editable words={words} setWords={setWords} />
      <AsyncButton
        disabled={!words.every(word => word.match(PASSPHRASE_REGEX))}
        label="Confirm"
        onClick={() => onNext(words)}
      />
    </div>
  )
}
