import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"

import { PageError } from "components/PageError"
import { PageLoader } from "components/PageLoader"
import { ViewAccount } from "components/ViewAccount/ViewAccount"
import { useRouteParam } from "hooks/useRouteParam"
import { Route, RouteParam } from "lib/utils/navigation"

export default function ViewAccountPage() {
  const router = useRouter()
  const address = useRouteParam(RouteParam.ADDRESS)

  if (!router.isReady) {
    return <PageLoader />
  }

  if (!address || !algosdk.isValidAddress(address)) {
    return (
      <PageError error="This address is invalid.">
        <Link href={Route.ACCOUNT_LIST}>
          <a>Bring me home.</a>
        </Link>
      </PageError>
    )
  }

  return <ViewAccount address={address} />
}
