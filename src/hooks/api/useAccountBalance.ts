import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/api"

export function useAccountBalance(
  account: AccountInfo | null,
  assetId: number
): number {
  const { config } = useNetworkContext()

  if (assetId === config.native_asset.index) {
    return account?.amount ?? 0
  }

  const asset = account?.assets?.find(a => a.assetId === assetId)

  return asset?.amount ?? 0
}
