import styled from "@emotion/styled"
import { useMemo } from "react"

import { useContacts } from "hooks/storage/useContacts"
import { getContactName } from "lib/storage/contacts"

import { AccountListItem } from "./AccountListItem"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export function AccountList() {
  const { data: accounts, loading, error } = useContacts()

  const sortedAccounts = useMemo(
    () =>
      Object.keys(accounts)
        .filter(address => accounts[address].auth)
        .sort((addressA, addressB) => {
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
    <Container>
      {sortedAccounts.map(address => (
        <AccountListItem
          address={address}
          data={accounts[address]}
          key={address}
        />
      ))}
    </Container>
  )
}
