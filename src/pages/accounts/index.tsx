import Link from "next/link"

import { useAddressBook } from "context/AddressBookContext"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

export default function HomePage() {
  const { accounts } = useAddressBook()

  return (
    <div>
      {accounts
        .filter(account => account.watch)
        .map(account => {
          const href = replaceParams(Route.ACCOUNTS_VIEW, {
            [RouteParam.ADDRESS]: account.address,
          })

          return (
            <Link href={href} key={account.address}>
              <a>
                <div title={account.address}>{account.name}</div>
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
