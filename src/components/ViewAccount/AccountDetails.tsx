import { Network, useNetworkContext } from "context/NetworkContext"
import { useAccountInfo } from "hooks/useAccountInfo"
import { Address } from "lib/algo/Account"
import { AccountData } from "lib/db/schema"

import { StandardAsset } from "./StandardAsset"

export type AccountDetailsProps = {
  address: Address
  data: AccountData
}

export default function AccountDetails({ address, data }: AccountDetailsProps) {
  const { data: account, error } = useAccountInfo(address)
  const { config, network } = useNetworkContext()

  if (error) {
    if (error.message.match(/found/i)) {
      if (network === Network.TEST) {
        return (
          <pre>
            This account has not been funded. You can activate it by sending at
            least 0.1 Algos to {address} or by using the faucet at{" "}
            <a href="https://bank.testnet.algorand.network">
              https://bank.testnet.algorand.network
            </a>
            .
          </pre>
        )
      }

      return (
        <pre>
          This account has not been funded. You can activate it by sending at
          least 0.1 Algos to {address}.
        </pre>
      )
    }

    return <pre>Error: {error.message}</pre>
  }

  if (!account) {
    return <pre>Loading...</pre>
  }

  return (
    <div>
      <pre title={address}>{data.name ?? address}</pre>
      <StandardAsset
        assetId={config.native_asset.index}
        amount={account.amount}
      />
      {account.assets?.map(asset => (
        <StandardAsset
          key={asset["asset-id"]}
          assetId={asset["asset-id"]}
          amount={asset.amount}
          frozen={asset["is-frozen"]}
        />
      ))}
    </div>
  )
}
