import AppStorage from "@randlabs/encrypted-local-storage"

import { AsyncButton } from "components/AsyncButton"
import { useAddressBook } from "context/AddressBookContext"

export default function ContactsPage() {
  const { accounts, removeAccount, updateAccount, addAccount } =
    useAddressBook()

  const onRenameContact = async (address: string) => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (name) {
      await updateAccount(address, { name })
    }
  }

  const onRemoveContact = async (address: string) => {
    await removeAccount(address)
  }

  const onAddContact = async () => {
    // eslint-disable-next-line no-alert
    const address = window.prompt("string")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (address && name) {
      await AppStorage.setItem("key", "item")
      await addAccount(address, { name })
    }
  }

  return (
    <div>
      <h3>Contacts:</h3>
      {Object.keys(accounts)
        .filter(address => !accounts[address].auth)
        .map(address => (
          <div key={address}>
            <p title={address}>{accounts[address].name}</p>
            <AsyncButton
              label="Rename"
              onClick={() => onRenameContact(address)}
            />
            <AsyncButton
              label="Remove"
              onClick={() => onRemoveContact(address)}
            />
          </div>
        ))}
      <AsyncButton label="Add" onClick={onAddContact} />
    </div>
  )
}
