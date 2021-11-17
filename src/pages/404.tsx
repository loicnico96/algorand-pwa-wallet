import Link from "next/link"

import { Route } from "lib/utils/navigation"

export default function NotFoundPage() {
  return (
    <div>
      <p>Are you lost?</p>
      <p>
        <Link href={Route.ACCOUNT_LIST}>
          <a>Bring me home.</a>
        </Link>
      </p>
    </div>
  )
}
