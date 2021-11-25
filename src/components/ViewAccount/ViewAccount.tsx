import { Link } from "components/Link"
import { PageContent } from "components/PageContent"
import { PageError } from "components/PageError"
import { PageLoader } from "components/PageLoader"
import { Network, useNetworkContext } from "context/NetworkContext"
import { useAccountInfo } from "hooks/api/useAccountInfo"
import { useContact } from "hooks/storage/useContact"
import { AccountStatus } from "lib/algo/Account"
import { toClipboard } from "lib/utils/clipboard"
import { Route } from "lib/utils/navigation"

import AccountDetails from "./AccountDetails"
import { ViewOtherAccountActions } from "./ViewOtherAccountActions"
import { ViewOwnAccountActions } from "./ViewOwnAccountActions"

export interface ViewAccountProps {
  address: string
}

export function ViewAccount({ address }: ViewAccountProps) {
  const { network } = useNetworkContext()
  const { data: account, error } = useAccountInfo(address)
  const { data: contactData } = useContact(address)

  if (error) {
    return <PageError message={error.message} />
  }

  if (!account) {
    return <PageLoader message="Loading account details..." />
  }

  if (account.status === AccountStatus.EMPTY) {
    return (
      <PageError message="This account has not been funded.">
        {contactData.auth && (
          <p>
            You can activate it by sending at least 0.1 Algos to {address}
            {network === Network.TEST && (
              <>
                {" "}
                or by using the faucet at{" "}
                <Link href="https://bank.testnet.algorand.network" />
              </>
            )}
            .
            <button onClick={() => toClipboard(address)}>
              Copy to clipboard
            </button>
          </p>
        )}
      </PageError>
    )
  }

  return (
    <PageContent>
      <Link href={Route.ACCOUNTS_LIST}>Back</Link>
      <AccountDetails account={account} />
      {contactData.auth ? (
        <ViewOwnAccountActions account={account} />
      ) : (
        <ViewOtherAccountActions account={account} />
      )}
    </PageContent>
  )
}
