import { fetchJson } from "lib/utils/fetchJson"
import { useNetworkContext } from "context/NetworkContext"
import { useQuery, UseQueryResult } from "./useQuery"
import { AssetId } from "lib/algo/Asset"

export type AssetPrices = { [assetId in AssetId]?: number }

export function useAssetPrices(): UseQueryResult<AssetPrices> {
  const { config, network } = useNetworkContext()

  return useQuery(`${network}:assets/prices`, async () => {
    const prices: AssetPrices = {}
    const assets = await fetchJson<Record<string, { price: number }>>(
      config.prices_api.url
    )

    for (const assetId in assets) {
      const price = Number(assets[assetId].price)

      // Tinyman prices API uses 0 for Algo
      if (Number(assetId) === 0) {
        prices[config.native_asset.index] = price
      } else {
        prices[Number(assetId)] = price
      }
    }

    return prices
  })
}
