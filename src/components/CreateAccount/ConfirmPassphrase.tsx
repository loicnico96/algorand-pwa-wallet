import { useCallback, useState } from "react"

import { fill } from "lib/utils/arrays"

import { Passphrase, PASSPHRASE_LENGTH } from "./Passphrase"

export interface ConfirmPassphraseProps {
  onBack: () => Promise<void>
  onNext: () => Promise<void>
  passphrase: string[]
}

export function selectRandomIndexes(): number[] {
  const allIndexes = fill(PASSPHRASE_LENGTH, index => index)
  const selectedIndexes: number[] = []
  while (allIndexes.length > 0 && selectedIndexes.length < 6) {
    const random = Math.floor(Math.random() * allIndexes.length)
    selectedIndexes.push(...allIndexes.splice(random, 1))
  }

  return selectedIndexes
}

export function ConfirmPassphrase({
  onBack,
  onNext,
  passphrase,
}: ConfirmPassphraseProps) {
  const [indexes] = useState(selectRandomIndexes)

  const onSubmit = useCallback(
    async (words: string[]) => {
      for (const index of indexes) {
        if (words[index] !== passphrase[index]) {
          throw Error("Passphrase does not match.")
        }
      }

      await onNext()
    },
    [onNext, indexes, passphrase]
  )

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Confirm that you have stored your passphrase correctly by filling the
        missing words.
      </p>
      <Passphrase
        autoFocus
        editable={indexes}
        initialValues={passphrase.map((w, i) => (indexes.includes(i) ? "" : w))}
        onSubmit={onSubmit}
      />
    </div>
  )
}
