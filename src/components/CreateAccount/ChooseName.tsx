import Link from "next/link"
import { useCallback, useState } from "react"

import { AccountData } from "lib/db/schema"

export interface ChooseNameProps {
  defaultName?: string
  defaultNote?: string
  onBack: string | (() => unknown)
  onNext: (data: AccountData) => unknown
}

export function ChooseName({
  defaultName = "",
  defaultNote = "",
  onBack,
  onNext,
}: ChooseNameProps) {
  const [name, setName] = useState(defaultName)
  const [note, setNote] = useState(defaultNote)

  const onConfirm = useCallback(() => {
    if (name.trim()) {
      onNext({
        name: name.trim(),
        note: note.trim() || undefined,
      })
    }
  }, [onNext, name, note])

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
        Choose a name for your account. This information will be stored on your
        device only.
      </p>
      <input
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        type="text"
        value={name}
      />
      <input
        onChange={e => setNote(e.target.value)}
        placeholder="Note (optional)"
        type="text"
        value={note}
      />
      <button disabled={!name.trim()} onClick={onConfirm}>
        Confirm
      </button>
    </div>
  )
}
