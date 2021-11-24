import { useNetworkContext } from "context/NetworkContext"
import { fetchJson } from "lib/utils/fetchJson"
import { useQuery, UseQueryResult } from "./useQuery"

export type AssetPrices = { [assetId in number]?: number }

export function useAssetPrices(): UseQueryResult<AssetPrices> {
  const { config } = useNetworkContext()

  return useQuery("api/assets/prices", async () => {
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
