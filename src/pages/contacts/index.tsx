import Link from "next/link"

import { AsyncButton } from "components/AsyncButton"
import { useAddressBook } from "context/AddressBookContext"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

export default function ContactsPage() {
  const { accounts, removeAccount, updateAccount } = useAddressBook()

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
      await updateAccount(address, { name })
    }
  }

  return (
    <div>
      <Link href={Route.ACCOUNTS_LIST}>
        <a>Back</a>
      </Link>
      <h3>Contacts:</h3>
      {Object.keys(accounts).map(address => {
        const account = accounts[address]
        const accountUrl = replaceParams(Route.ACCOUNTS_VIEW, {
          [RouteParam.ADDRESS]: address,
        })

        return (
          <div key={address}>
            <Link href={accountUrl}>
              <a>
                <p title={address}>{account.name}</p>
              </a>
            </Link>
            <AsyncButton
              label="Rename"
              onClick={() => onRenameContact(address)}
            />
            <AsyncButton
              label="Remove"
              onClick={() => onRemoveContact(address)}
            />
          </div>
        )
      })}
      <AsyncButton label="Add" onClick={onAddContact} />
    </div>
  )
}
