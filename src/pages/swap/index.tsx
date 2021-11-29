import { SwapForm } from "components/Form/SwapForm"
import { PageContent } from "components/PageContent"
import { Link } from "components/Primitives/Link"
import { Route } from "lib/utils/navigation"

export default function SwapPage() {
  return (
    <PageContent>
      <Link href={Route.ACCOUNTS_LIST}>Back</Link>
      <SwapForm />
    </PageContent>
  )
}
