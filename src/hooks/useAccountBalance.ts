import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/Account"

export function useAccountBalance(
  account: AccountInfo | null,
  assetId: number
): number {
  const { config } = useNetworkContext()

  if (assetId === config.native_asset.index) {
    return account?.amount ?? 0
  }

  return (
    account?.assets?.find(asset => asset["asset-id"] === assetId)?.amount ?? 0
  )
}
