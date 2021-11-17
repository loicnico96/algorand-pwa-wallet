import { useCallback, useEffect, useState } from "react"

import { Network, useNetworkContext } from "context/NetworkContext"
import {
  Account,
  addAccount,
  getAccounts,
  removeAccount,
  updateAccount,
} from "lib/db/schema"

export default function ContactsPage() {
  const { network, setNetwork } = useNetworkContext()

  const [contacts, setContacts] = useState<Account[]>([])

  const refetch = useCallback(() => {
    getAccounts(network).then(setContacts).catch(console.error)
  }, [network])

  useEffect(() => {
    refetch()
  }, [refetch])

  const onChangeNetwork = () => {
    setNetwork(network === Network.TEST ? Network.MAIN : Network.TEST)
  }

  const onRenameContact = (address: string) => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (name) {
      updateAccount(network, address, {
        name,
      })
        .then(refetch)
        .catch(console.error)
    }
  }

  const onRemoveContact = (address: string) => {
    removeAccount(network, address).then(refetch).catch(console.error)
  }

  const onAddAccount = () => {
    // eslint-disable-next-line no-alert
    const address = window.prompt("Address")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")
    // eslint-disable-next-line no-alert
    const key = window.prompt("Key")

    if (address && name && key) {
      addAccount(network, address, {
        name,
        key,
      })
        .then(refetch)
        .catch(console.error)
    }
  }

  const onAddContact = () => {
    // eslint-disable-next-line no-alert
    const address = window.prompt("Address")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (address && name) {
      addAccount(network, address, {
        name,
      })
        .then(refetch)
        .catch(console.error)
    }
  }

  return (
    <div>
      <h3>Network:</h3>
      <div>
        <p>{network}</p>
        <button onClick={onChangeNetwork}>Change</button>
        <button onClick={refetch}>Refetch</button>
      </div>
      <h3>Accounts:</h3>
      {contacts
        .filter(contact => contact.key)
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
      {contacts
        .filter(contact => !contact.key)
        .map(contact => (
          <div key={contact.address}>
            <p title={contact.address}>{contact.name}</p>
            <button onClick={() => onRenameContact(contact.address)}>
              Rename
            </button>
            <button onClick={() => onRemoveContact(contact.address)}>
              Remove
            </button>
          </div>
        ))}
      <button onClick={onAddContact}>Add</button>
    </div>
  )
}
