import Link from "next/link"
import { useCallback, useState } from "react"

export interface RestorePassphraseProps {
  onBack: string | (() => unknown)
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
      {typeof onBack === "string" ? (
        <Link href={onBack}>
          <a>Back</a>
        </Link>
      ) : (
        <a onClick={onBack}>Back</a>
      )}
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
      <button disabled={!words.every(Boolean)} onClick={onConfirm}>
        Confirm
      </button>
    </div>
  )
}
