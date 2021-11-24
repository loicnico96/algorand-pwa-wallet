import Link from "next/link"
import { useMemo } from "react"

import { useContacts } from "hooks/storage/useContacts"
import { getContactName } from "lib/storage/contacts"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

export default function HomePage() {
  const { data: accounts } = useContacts()

  const sortedAddresses = useMemo(
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

  return (
    <div>
      {sortedAddresses.map(address => {
        const accountUrl = replaceParams(Route.ACCOUNTS_VIEW, {
          [RouteParam.ADDRESS]: address,
        })

        return (
          <Link href={accountUrl} key={address}>
            <a>
              <div title={address}>
                {getContactName(address, accounts[address])}
              </div>
            </a>
          </Link>
        )
      })}
      <Link href={Route.ACCOUNTS_CREATE}>
        <a>
          <button>Create account</button>
        </a>
      </Link>
      <Link href={Route.ACCOUNTS_RESTORE}>
        <a>
          <button>Restore account</button>
        </a>
      </Link>
      <Link href={Route.CONTACTS}>
        <a>Contacts</a>
      </Link>
    </div>
  )
}
