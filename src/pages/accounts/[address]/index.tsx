import algosdk from "algosdk"
import Link from "next/link"

import { ViewAccount } from "components/ViewAccount/ViewAccount"
import { useRouteParam } from "hooks/useRouteParam"
import { Route, RouteParam } from "lib/utils/navigation"

export default function ViewAccountPage() {
  const address = useRouteParam(RouteParam.ADDRESS)

  if (!address || !algosdk.isValidAddress(address)) {
    return (
      <div>
        <p>This address is invalid.</p>
        <p>
          <Link href={Route.ACCOUNT_LIST}>
            <a>Bring me home.</a>
          </Link>
        </p>
      </div>
    )
  }

  return <ViewAccount address={address} />
}
