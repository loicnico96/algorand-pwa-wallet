import { PageContent } from "components/PageContent"
import { Link } from "components/Primitives/Link"
import { AccountList } from "components/Widgets/AccountList"
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
      <div>
        <Link href={Route.SEND}>Send</Link>
      </div>
      <div>
        <Link href={Route.SWAP}>Swap</Link>
      </div>
    </PageContent>
  )
}
