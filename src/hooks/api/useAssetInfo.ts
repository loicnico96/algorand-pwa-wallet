import { useNetworkContext } from "context/NetworkContext"
import { AssetInfo } from "lib/algo/api"
import { getAssetInfo } from "lib/algo/api/asset"
import { useQuery, UseQueryResult } from "./useQuery"

export function useAssetInfo(assetId: number): UseQueryResult<AssetInfo> {
  const { config, indexer } = useNetworkContext()

  return useQuery(
    `api/assets/${assetId}`,
    () => getAssetInfo(indexer, config, assetId),
    {
      immutable: true,
    }
  )
}
