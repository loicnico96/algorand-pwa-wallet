import Link from "next/link"
import { useCallback, useState } from "react"

export interface ConfirmPassphraseProps {
  onBack: string | (() => unknown)
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
      {typeof onBack === "string" ? (
        <Link href={onBack}>
          <a>Back</a>
        </Link>
      ) : (
        <a onClick={onBack}>Back</a>
      )}
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
      <button disabled={!words.every(Boolean)} onClick={onConfirm}>
        Confirm
      </button>
    </div>
  )
}
