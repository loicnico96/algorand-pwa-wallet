export interface PassphaseProps {
  editable?: boolean | number[]
  setWords?: (word: string[]) => void
  words: string[]
}

export const PASSPHRASE_LENGTH = 25
export const PASSPHRASE_REGEX = /^[a-z]+$/

export function Passphrase({ editable, setWords, words }: PassphaseProps) {
  return (
    <div>
      {words.map((word, index) => (
        <div key={index}>
          <pre>{index}:</pre>
          <input
            disabled={
              Array.isArray(editable) ? !editable.includes(index) : !editable
            }
            onFocus={e => e.target.select()}
            onChange={e => {
              if (setWords) {
                const v = e.target.value.trim()
                setWords(words.map((w, i) => (i === index ? v : w)))
              }
            }}
            pattern="[a-z]+"
            type="text"
            value={word}
          />
          {word !== "" && !word.match(PASSPHRASE_REGEX) && (
            <span style={{ color: "red" }}>
              Invalid character. Only lower case latin (a-z) characters are
              accepted.
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
