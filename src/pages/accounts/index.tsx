import { AccountList } from "components/AccountList"
import { Link } from "components/Link"
import { PageContent } from "components/PageContent"
import { Route } from "lib/utils/navigation"

export default function HomePage() {
  return (
    <PageContent>
      <AccountList />
      <div>
        <Link href={Route.ACCOUNTS_CREATE}>
          <button>Create account</button>
        </Link>
        <Link href={Route.ACCOUNTS_RESTORE}>
          <button>Restore account</button>
        </Link>
      </div>
      <div>
        <Link href={Route.CONTACTS}>Contacts</Link>
      </div>
    </PageContent>
  )
}
