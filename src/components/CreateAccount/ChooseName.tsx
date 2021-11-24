import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useContact } from "hooks/storage/useContact"

export interface ChooseNameProps {
  address: string
  onBack: () => unknown
  onNext: () => unknown
}

export function ChooseName({ address, onBack, onNext }: ChooseNameProps) {
  const { data: contactData, updateContact } = useContact(address)

  const [name, setName] = useState(contactData?.name ?? "")
  const [note, setNote] = useState(contactData?.note ?? "")

  const onConfirm = useCallback(async () => {
    if (name.trim()) {
      await updateContact({
        name: name.trim(),
        note: note.trim() || undefined,
      })
      await onNext()
    }
  }, [name, note, onNext, updateContact])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose a name for your account. This information will be stored on your
        device only.
      </p>
      <input
        autoFocus
        id="input-name"
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        type="text"
        value={name}
      />
      <input
        id="input-note"
        onChange={e => setNote(e.target.value)}
        placeholder="Note (optional)"
        type="text"
        value={note}
      />
      <AsyncButton
        disabled={!name.trim()}
        label="Confirm"
        id="submit"
        onClick={onConfirm}
      />
    </div>
  )
}
