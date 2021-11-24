export interface PassphaseProps {
  autoFocus?: boolean
  editable?: boolean | number[]
  setWords?: (word: string[]) => void
  words: string[]
}

export const PASSPHRASE_LENGTH = 25
export const PASSPHRASE_REGEX = /^[a-z]+$/

export function Passphrase({
  autoFocus,
  editable,
  setWords,
  words,
}: PassphaseProps) {
  return (
    <div>
      {words.map((word, index) => (
        <div key={index}>
          <pre>{index}:</pre>
          <input
            autoFocus={
              autoFocus &&
              index === (Array.isArray(editable) ? Math.min(...editable) : 0)
            }
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
            onKeyPress={e => {
              if (e.key === "Enter") {
                if (e.currentTarget.value.match(PASSPHRASE_REGEX)) {
                  // Focus next editable word
                  for (let i = index + 1; i < words.length; i++) {
                    const el = document.getElementById(`input-word-${i}`)
                    if (el && el.getAttribute("disabled") === null) {
                      el.focus()
                      return
                    }
                  }

                  // Focus first invalid word
                  for (let i = 0; i < words.length; i++) {
                    const el = document.getElementById(
                      `input-word-${i}`
                    ) as HTMLInputElement | null
                    if (el && !el.value?.match(PASSPHRASE_REGEX)) {
                      el.focus()
                      return
                    }
                  }

                  // Focus submit button
                  const el = document.getElementById("submit")
                  if (el && el.getAttribute("disabled") === null) {
                    el.focus()
                  }
                } else {
                  e.currentTarget.select()
                }
              }
            }}
            id={`input-word-${index}`}
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
