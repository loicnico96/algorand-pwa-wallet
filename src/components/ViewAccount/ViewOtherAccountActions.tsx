import { useCallback } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useAddressBook } from "context/AddressBookContext"
import { Address } from "lib/algo/Account"
import { AccountData } from "lib/db/schema"

export interface ViewOtherAccountActionsProps {
  address: Address
  data: AccountData | null
}

export function ViewOtherAccountActions({
  address,
  data,
}: ViewOtherAccountActionsProps) {
  const { addAccount, removeAccount, updateAccount } = useAddressBook()

  const onAddContact = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Enter name:")

    if (name) {
      await addAccount(address, { name })
    }
  }, [address, addAccount])

  const onRemoveContact = useCallback(async () => {
    await removeAccount(address)
  }, [address, removeAccount])

  const onRenameContact = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Enter new name:")

    if (name) {
      await updateAccount(address, { name })
    }
  }, [address, updateAccount])

  if (data) {
    return (
      <div>
        <AsyncButton onClick={onRenameContact} label="Rename contact" />
        <AsyncButton onClick={onRemoveContact} label="Remove contact" />
      </div>
    )
  }

  return (
    <div>
      <AsyncButton onClick={onAddContact} label="Add contact" />
    </div>
  )
}
