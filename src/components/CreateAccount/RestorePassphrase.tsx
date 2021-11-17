import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"

export interface RestorePassphraseProps {
  onBack: () => unknown
  onNext: (passphrase: string[]) => unknown
}

export function RestorePassphrase({ onBack, onNext }: RestorePassphraseProps) {
  const [words, setWords] = useState(Array(25).fill(""))

  const setWord = useCallback((index: number, word: string) => {
    setWords(phrase => phrase.map((v, i) => (i === index ? word : v)))
  }, [])

  const onConfirm = useCallback(() => {
    onNext(words)
  }, [onNext, words])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>Fill your passphrase (order matters).</p>
      {words.map((value, index) => (
        <div key={index}>
          <pre>{index}:</pre>
          <input
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
