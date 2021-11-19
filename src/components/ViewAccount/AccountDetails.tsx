import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/Account"
import { AccountData } from "lib/db/schema"

import { StandardAsset } from "./StandardAsset"

export type AccountDetailsProps = {
  account: AccountInfo
  data: AccountData | null
}

export default function AccountDetails({ account, data }: AccountDetailsProps) {
  const { config } = useNetworkContext()

  return (
    <div>
      <pre title={account.address}>{data?.name ?? account.address}</pre>
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
