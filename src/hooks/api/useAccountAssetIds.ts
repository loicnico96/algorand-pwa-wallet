import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/api"
import { useMemo } from "react"

export function useAccountAssetIds(account: AccountInfo | null): number[] {
  const { config } = useNetworkContext()

  return useMemo(() => {
    const assetIds = [config.native_asset.index]

    if (account?.assets) {
      for (const asset of account.assets) {
        assetIds.push(asset.assetId)
      }
    }

    return assetIds
  }, [account, config])
}
