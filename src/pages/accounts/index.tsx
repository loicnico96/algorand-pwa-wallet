import Link from "next/link"

import { useAddressBook } from "context/AddressBookContext"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

export default function HomePage() {
  const { accounts } = useAddressBook()

  return (
    <div>
      {Object.keys(accounts)
        .filter(address => accounts[address].auth)
        .map(address => {
          const href = replaceParams(Route.ACCOUNTS_VIEW, {
            [RouteParam.ADDRESS]: address,
          })

          return (
            <Link href={href} key={address}>
              <a>
                <div title={address}>{accounts[address].name}</div>
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
    </div>
  )
}
