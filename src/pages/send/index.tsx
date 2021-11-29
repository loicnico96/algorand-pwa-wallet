import { SendForm } from "components/Form/SendForm"
import { PageContent } from "components/PageContent"
import { Link } from "components/Primitives/Link"
import { Route } from "lib/utils/navigation"

export default function SendPage() {
  return (
    <PageContent>
      <Link href={Route.ACCOUNTS_LIST}>Back</Link>
      <SendForm />
    </PageContent>
  )
}
