import { useCallback } from "react"

import { Button } from "components/Primitives/Button"
import { useContact } from "hooks/storage/useContact"
import { AccountInfo } from "lib/algo/Account"

export interface ViewOtherAccountActionsProps {
  account: AccountInfo
}

export function ViewOtherAccountActions({
  account,
}: ViewOtherAccountActionsProps) {
  const { address } = account
  const {
    data: contactData,
    removeContact,
    updateContact,
  } = useContact(address)

  const onAddContact = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Enter name:")

    if (name) {
      await updateContact({ name })
    }
  }, [updateContact])

  const onRenameContact = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Enter new name:")

    if (name) {
      await updateContact({ name })
    }
  }, [updateContact])

  if (contactData.name) {
    return (
      <div>
        <Button onClick={onRenameContact} label="Rename contact" />
        <Button onClick={removeContact} label="Remove contact" />
      </div>
    )
  }

  return (
    <div>
      <Button onClick={onAddContact} label="Add contact" />
    </div>
  )
}
