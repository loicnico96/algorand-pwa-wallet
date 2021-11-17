import { useNetworkContext } from "context/NetworkContext"
import { AssetInfo } from "lib/algo/Asset"
import useSWR from "swr"

export interface UseAssetInfoResult {
  asset: AssetInfo | null
  error: Error | null
  isValidating: boolean
  revalidate: () => void
}

export function useAssetInfo(assetId: number): UseAssetInfoResult {
  const { config, network, indexer } = useNetworkContext()

  const { data, error, isValidating, mutate } = useSWR(
    `${network}:assets/${assetId}`,
    async () => {
      if (assetId === config.native_asset.index) {
        return config.native_asset
      }

      const { asset } = await indexer.lookupAssetByID(assetId).do()
      return asset as AssetInfo
    }
  )

  return {
    asset: data ?? null,
    error,
    isValidating,
    revalidate: mutate,
  }
}
