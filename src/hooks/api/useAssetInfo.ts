import { useNetworkContext } from "context/NetworkContext"
import { AssetInfo, getAssetInfo } from "lib/algo/api"
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
