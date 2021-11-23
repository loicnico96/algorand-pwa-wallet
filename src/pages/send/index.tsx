import Link from "next/link"

import { SendForm } from "components/Form/SendForm"
import { PageContent } from "components/PageContent"
import { Route } from "lib/utils/navigation"

export default function SendPage() {
  return (
    <PageContent>
      <Link href={Route.ACCOUNTS_LIST}>
        <a>Back</a>
      </Link>
      <SendForm />
    </PageContent>
  )
}
