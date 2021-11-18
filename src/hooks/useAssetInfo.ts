import { useNetworkContext } from "context/NetworkContext"
import { AssetId, AssetInfo } from "lib/algo/Asset"
import { useQuery, UseQueryResult } from "./useQuery"

export function useAssetInfo(assetId: AssetId): UseQueryResult<AssetInfo> {
  const { config, network, indexer } = useNetworkContext()

  return useQuery(`${network}:assets/${assetId}`, async () => {
    if (assetId === config.native_asset.index) {
      return config.native_asset
    }

    const { asset } = await indexer.lookupAssetByID(assetId).do()
    return asset as AssetInfo
  })
}
