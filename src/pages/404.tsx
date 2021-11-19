import Link from "next/link"

import { PageError } from "components/PageError"
import { Route } from "lib/utils/navigation"

export default function NotFoundPage() {
  return (
    <PageError message="Are you lost?">
      <Link href={Route.ACCOUNT_LIST}>
        <a>Bring me home.</a>
      </Link>
    </PageError>
  )
}
