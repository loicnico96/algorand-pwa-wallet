import Link from "next/link"
import { useMemo } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useContacts } from "hooks/storage/useContacts"
import { getContactName } from "lib/storage/contacts"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

export default function ContactsPage() {
  const { data: accounts, removeContact, updateContact } = useContacts()

  const onRenameContact = async (address: string) => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (name) {
      await updateContact(address, { name })
    }
  }

  const onRemoveContact = async (address: string) => {
    await removeContact(address)
  }

  const onAddContact = async () => {
    // eslint-disable-next-line no-alert
    const address = window.prompt("Address")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (address && name) {
      await updateContact(address, { name })
    }
  }

  const sortedAddresses = useMemo(
    () =>
      Object.keys(accounts).sort((addressA, addressB) => {
        const nameA = getContactName(addressA, accounts[addressA])
        const nameB = getContactName(addressB, accounts[addressB])
        return nameA.localeCompare(nameB)
      }),
    [accounts]
  )

  return (
    <div>
      <Link href={Route.ACCOUNTS_LIST}>
        <a>Back</a>
      </Link>
      <h3>Contacts:</h3>
      {sortedAddresses.map(address => {
        const accountUrl = replaceParams(Route.ACCOUNTS_VIEW, {
          [RouteParam.ADDRESS]: address,
        })

        return (
          <div key={address}>
            <Link href={accountUrl}>
              <a>
                <p title={address}>
                  {getContactName(address, accounts[address])}
                </p>
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
