import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"

export interface ConfirmPassphraseProps {
  onBack: () => unknown
  onNext: () => unknown
  passphrase: string[]
}

export function ConfirmPassphrase({
  onBack,
  onNext,
  passphrase,
}: ConfirmPassphraseProps) {
  const [indexes] = useState([2, 6, 8, 14, 15, 21])
  const [words, setWords] = useState(
    passphrase.map((word, index) => (indexes.includes(index) ? "" : word))
  )

  const setWord = useCallback((index: number, word: string) => {
    setWords(phrase => phrase.map((v, i) => (i === index ? word : v)))
  }, [])

  const onConfirm = useCallback(() => {
    if (words.every((word, index) => word === passphrase[index])) {
      onNext()
    } else {
      setWords(
        passphrase.map((word, index) =>
          word !== passphrase[index] ? "" : word
        )
      )
    }
  }, [onNext, words, passphrase])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Confirm that you have stored your passphrase correctly by filling the
        missing words.
      </p>
      {words.map((value, index) => (
        <div key={index}>
          <pre>{index}:</pre>
          <input
            disabled={!indexes.includes(index)}
            onChange={e => setWord(index, e.target.value)}
            type="text"
            value={value}
          />
        </div>
      ))}
      <AsyncButton
        disabled={!words.every(Boolean)}
        label="Confirm"
        onClick={onConfirm}
      />
    </div>
  )
}
