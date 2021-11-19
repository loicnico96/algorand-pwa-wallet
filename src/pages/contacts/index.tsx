import { useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"

export default function ContactsPage() {
  const { network } = useNetworkContext()
  const { accounts, removeAccount, updateAccount, addAccount } =
    useAddressBook()

  const onRenameContact = (address: string) => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (name) {
      updateAccount(address, {
        name,
      }).catch(console.error)
    }
  }

  const onRemoveContact = (address: string) => {
    removeAccount(address).catch(console.error)
  }

  const onAddAccount = () => {
    // eslint-disable-next-line no-alert
    const address = window.prompt("Address")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")
    // eslint-disable-next-line no-alert
    const key = window.prompt("Key")

    if (address && name && key) {
      addAccount(address, {
        name,
        key,
      }).catch(console.error)
    }
  }

  const onAddContact = () => {
    // eslint-disable-next-line no-alert
    const address = window.prompt("Address")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (address && name) {
      addAccount(address, {
        name,
      }).catch(console.error)
    }
  }

  return (
    <div>
      <h3>Network:</h3>
      <div>
        <p>{network}</p>
      </div>
      <h3>Accounts:</h3>
      {accounts
        .filter(account => account.key)
        .map(account => (
          <div key={account.address + account.key}>
            <p title={account.address}>{account.name}</p>
            <p title={account.key}>Key</p>
            <button onClick={() => onRenameContact(account.address)}>
              Rename
            </button>
            <button onClick={() => onRemoveContact(account.address)}>
              Remove
            </button>
          </div>
        ))}
      <button onClick={onAddAccount}>Add</button>
      <h3>Contacts:</h3>
      {accounts
        .filter(account => !account.key)
        .map(account => (
          <div key={account.address}>
            <p title={account.address}>{account.name}</p>
            <button onClick={() => onRenameContact(account.address)}>
              Rename
            </button>
            <button onClick={() => onRemoveContact(account.address)}>
              Remove
            </button>
          </div>
        ))}
      <button onClick={onAddContact}>Add</button>
    </div>
  )
}
