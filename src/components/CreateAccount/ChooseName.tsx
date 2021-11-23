import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useAccountData, useAddressBook } from "context/AddressBookContext"

export interface ChooseNameProps {
  address: string
  onBack: () => unknown
  onNext: () => unknown
}

export function ChooseName({ address, onBack, onNext }: ChooseNameProps) {
  const { updateAccount } = useAddressBook()

  const data = useAccountData(address)

  const [name, setName] = useState(data?.name ?? "")
  const [note, setNote] = useState(data?.note ?? "")

  const onConfirm = useCallback(async () => {
    if (name.trim()) {
      await updateAccount(address, {
        name: name.trim(),
        note: note.trim() || undefined,
      })
      onNext()
    }
  }, [address, name, note, onNext, updateAccount])

  return (
    <div>
      <a onClick={onBack}>Back</a>
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
      <AsyncButton
        disabled={!name.trim()}
        label="Confirm"
        onClick={onConfirm}
      />
    </div>
  )
}
