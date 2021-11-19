import Link from "next/link"

import { PageError } from "components/PageError"
import { PageLoader } from "components/PageLoader"
import { useAccountData } from "context/AddressBookContext"
import { Network, useNetworkContext } from "context/NetworkContext"
import { useAccountInfo } from "hooks/useAccountInfo"
import { Address } from "lib/algo/Account"
import { Route } from "lib/utils/navigation"

import AccountDetails from "./AccountDetails"
import { ViewOtherAccountActions } from "./ViewOtherAccountActions"
import { ViewOwnAccountActions } from "./ViewOwnAccountActions"

export interface ViewAccountProps {
  address: Address
}

export function ViewAccount({ address }: ViewAccountProps) {
  const { network } = useNetworkContext()
  const { data: account, error } = useAccountInfo(address)
  const accountData = useAccountData(address)

  if (error) {
    if (error.message.match(/found/i)) {
      return (
        <PageError message="This account has not been funded.">
          {accountData?.key && (
            <p>
              You can activate it by sending at least 0.1 Algos to {address}
              {network === Network.TEST && (
                <>
                  {" "}
                  or by using the faucet at{" "}
                  <a href="https://bank.testnet.algorand.network">
                    https://bank.testnet.algorand.network
                  </a>
                </>
              )}
              .
            </p>
          )}
        </PageError>
      )
    }

    return <PageError message={error.message} />
  }

  if (!account) {
    return <PageLoader message="Loading account details..." />
  }

  return (
    <div>
      <Link href={Route.ACCOUNTS_LIST}>
        <a>Back</a>
      </Link>
      <AccountDetails account={account} data={accountData} />
      {accountData?.key ? (
        <ViewOwnAccountActions account={account} data={accountData} />
      ) : (
        <ViewOtherAccountActions address={account.address} data={accountData} />
      )}
    </div>
  )
}
