import { Link } from "components/Link"
import { PageError } from "components/PageError"
import { Route } from "lib/utils/navigation"

export default function NotFoundPage() {
  return (
    <PageError message="Are you lost?">
      <Link href={Route.ACCOUNTS_LIST}>Bring me home.</Link>
    </PageError>
  )
}
