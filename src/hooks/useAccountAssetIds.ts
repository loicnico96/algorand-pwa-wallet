import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/Account"
import { AssetId } from "lib/algo/Asset"
import { useMemo } from "react"

export function useAccountAssetIds(account: AccountInfo | null): AssetId[] {
  const { config } = useNetworkContext()

  return useMemo(() => {
    const assetIds = [config.native_asset.index]

    if (account?.assets) {
      for (const asset of account.assets) {
        assetIds.push(asset["asset-id"])
      }
    }

    return assetIds
  }, [account, config])
}
