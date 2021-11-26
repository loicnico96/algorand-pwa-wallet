import { useMemo } from "react"

import { CardList } from "components/Primitives/CardList"
import { useContacts } from "hooks/storage/useContacts"
import { getContactName } from "lib/storage/contacts"

import { ContactListItem } from "./ContactListItem"

export function ContactList() {
  const { data: accounts, loading, error } = useContacts()

  const sortedAccounts = useMemo(
    () =>
      Object.keys(accounts).sort((addressA, addressB) => {
        const nameA = getContactName(addressA, accounts[addressA])
        const nameB = getContactName(addressB, accounts[addressB])
        return nameA.localeCompare(nameB)
      }),
    [accounts]
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  return (
    <CardList>
      {sortedAccounts.map(address => (
        <ContactListItem
          address={address}
          data={accounts[address]}
          key={address}
        />
      ))}
    </CardList>
  )
}
