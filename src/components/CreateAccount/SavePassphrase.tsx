import Link from "next/link"

export interface SavePassphraseProps {
  onBack: string | (() => unknown)
  onNext: string | (() => unknown)
  passphrase: string[]
}

export function SavePassphrase({
  onBack,
  onNext,
  passphrase,
}: SavePassphraseProps) {
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
        This is your secret passphrase of 25 words. Write it down carefully
        (order matters), store it somewhere safe, and never share it with
        anyone. It will be required to restore your account from another device.
      </p>
      {passphrase.map((value, index) => (
        <div key={index}>
          <pre>
            {index}: {value}
          </pre>
        </div>
      ))}
      {typeof onNext === "string" ? (
        <Link href={onNext}>
          <a>
            <button>Confirm</button>
          </a>
        </Link>
      ) : (
        <button onClick={onNext}>Confirm</button>
      )}
    </div>
  )
}
