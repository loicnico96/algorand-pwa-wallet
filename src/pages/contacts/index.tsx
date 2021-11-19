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
    const address = window.prompt("Address")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (address && name) {
      await addAccount(address, { name })
    }
  }

  return (
    <div>
      <h3>Contacts:</h3>
      {accounts
        .filter(account => !account.key)
        .map(account => (
          <div key={account.address}>
            <p title={account.address}>{account.name}</p>
            <AsyncButton
              label="Rename"
              onClick={() => onRenameContact(account.address)}
            />
            <AsyncButton
              label="Remove"
              onClick={() => onRemoveContact(account.address)}
            />
          </div>
        ))}
      <AsyncButton label="Add" onClick={onAddContact} />
    </div>
  )
}
