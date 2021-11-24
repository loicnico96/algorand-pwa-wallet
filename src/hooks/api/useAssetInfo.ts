import { useNetworkContext } from "context/NetworkContext"
import { AssetInfo } from "lib/algo/Asset"
import { useQuery, UseQueryResult } from "./useQuery"

export function useAssetInfo(assetId: number): UseQueryResult<AssetInfo> {
  const { config, indexer } = useNetworkContext()

  return useQuery(
    `api/assets/${assetId}`,
    async () => {
      if (assetId === config.native_asset.index) {
        return config.native_asset
      }

      const { asset } = await indexer.lookupAssetByID(assetId).do()
      return asset as AssetInfo
    },
    {
      immutable: true,
    }
  )
}
