import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/Account"
import { useMemo } from "react"

export function useAccountAssetIds(
  account: AccountInfo | null,
  options: {
    nonZeroOnly?: boolean
  } = {}
): number[] {
  const { config } = useNetworkContext()

  return useMemo(() => {
    const assetIds = [config.native_asset.index]

    if (account?.assets) {
      for (const asset of account.assets) {
        if (asset.amount > 0 || !options.nonZeroOnly) {
          assetIds.push(asset["asset-id"])
        }
      }
    }

    return assetIds
  }, [account, config])
}
