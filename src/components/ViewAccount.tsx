import { NativeAsset } from "components/NativeAsset"
import { StandardAsset } from "components/StandardAsset"
import { useAccountInfo } from "hooks/useAccountInfo"
import { AlgoNetwork } from "lib/algo/Network"
import { ALGO_NETWORK } from "lib/utils/environment"

export type ViewAccountProps = {
  address: string
}

export default function ViewAccount({ address }: ViewAccountProps) {
  const { account, error } = useAccountInfo(address)

  if (error) {
    if (error.message.match(/found/i)) {
      if (ALGO_NETWORK === AlgoNetwork.TEST) {
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
      <pre>{address}</pre>
      <NativeAsset amount={account.amount} />
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