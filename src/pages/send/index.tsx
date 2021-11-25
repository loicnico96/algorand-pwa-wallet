import { SendForm } from "components/Form/SendForm"
import { Link } from "components/Link"
import { PageContent } from "components/PageContent"
import { Route } from "lib/utils/navigation"

export default function SendPage() {
  return (
    <PageContent>
      <Link href={Route.ACCOUNTS_LIST}>Back</Link>
      <SendForm />
    </PageContent>
  )
}
