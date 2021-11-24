import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"

import { Passphrase, PASSPHRASE_LENGTH, PASSPHRASE_REGEX } from "./Passphrase"

export interface ConfirmPassphraseProps {
  onBack: () => unknown
  onNext: () => unknown
  passphrase: string[]
}

export function selectRandomIndexes(): number[] {
  const allIndexes = Array(PASSPHRASE_LENGTH)
    .fill(0)
    .map((_, i) => i)
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
  const [words, setWords] = useState(
    passphrase.map((w, i) => (indexes.includes(i) ? "" : w))
  )

  const onConfirm = useCallback(() => {
    if (words.some((w, i) => w !== passphrase[i])) {
      setWords(words.map((w, i) => (w !== passphrase[i] ? "" : w)))
      throw Error("Passphrase does not match.")
    }

    onNext()
  }, [onNext, words, passphrase])

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
        words={words}
        setWords={setWords}
      />
      <AsyncButton
        id="submit"
        disabled={!words.every(word => word.match(PASSPHRASE_REGEX))}
        label="Confirm"
        onClick={onConfirm}
      />
    </div>
  )
}
