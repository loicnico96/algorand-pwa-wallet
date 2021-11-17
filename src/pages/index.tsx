import Link from "next/link"

import { useAddressBook } from "context/AddressBookContext"
import { replaceParams, Route } from "lib/utils/navigation"

export default function HomePage() {
  const { accounts } = useAddressBook()

  return (
    <div>
      {accounts
        .filter(account => account.key)
        .map(account => {
          const href = replaceParams(Route.ACCOUNT_VIEW, {
            address: account.address,
          })

          return (
            <Link href={href} key={account.address}>
              <a>
                <div title={account.address}>{account.name}</div>
              </a>
            </Link>
          )
        })}
      <Link href={Route.ACCOUNT_CREATE}>
        <a>
          <button>Create account</button>
        </a>
      </Link>
      <Link href={Route.ACCOUNT_RESTORE}>
        <a>
          <button>Restore account</button>
        </a>
      </Link>
    </div>
  )
}
