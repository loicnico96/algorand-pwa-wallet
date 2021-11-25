import algosdk from "algosdk"
import { useRouter } from "next/router"

import { Link } from "components/Link"
import { PageError } from "components/PageError"
import { PageLoader } from "components/PageLoader"
import { ViewAccount } from "components/ViewAccount/ViewAccount"
import { useRouteParam } from "hooks/navigation/useRouteParam"
import { Route, RouteParam } from "lib/utils/navigation"

export default function ViewAccountPage() {
  const router = useRouter()
  const address = useRouteParam(RouteParam.ADDRESS)

  if (!router.isReady) {
    return <PageLoader />
  }

  if (!algosdk.isValidAddress(address)) {
    return (
      <PageError message="This address is invalid.">
        <Link href={Route.ACCOUNTS_LIST}>Bring me home.</Link>
      </PageError>
    )
  }

  return <ViewAccount address={address} />
}
