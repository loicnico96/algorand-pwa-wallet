import Link from "next/link"

import { AccountList } from "components/AccountList"
import { PageContent } from "components/PageContent"
import { Route } from "lib/utils/navigation"

export default function HomePage() {
  return (
    <PageContent>
      <AccountList />
      <div>
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
      <div>
        <Link href={Route.CONTACTS}>
          <a>Contacts</a>
        </Link>
      </div>
    </PageContent>
  )
}
