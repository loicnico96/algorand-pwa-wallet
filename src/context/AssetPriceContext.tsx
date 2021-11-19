import { useQuery } from "hooks/useQuery"
import { AssetId } from "lib/algo/Asset"
import { fetchJson } from "lib/utils/fetchJson"
import { useContext } from "react"
import { useNetworkContext } from "./NetworkContext"
import { createEmptyContext, ProviderProps } from "./utils"

export type AssetPrices = { [assetId in AssetId]?: number }

export interface AssetPriceContextValue {
  error: Error | null
  loading: boolean
  prices: AssetPrices
  refetch(): Promise<AssetPrices>
}

export const AssetPriceContext = createEmptyContext<AssetPriceContextValue>()

export function AssetPriceContextProvider({ children }: ProviderProps) {
  const { config, network } = useNetworkContext()

  const { data, error, loading, refetch } = useQuery(
    `${network}:assets/prices`,
    async () => {
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
    }
  )

  const value: AssetPriceContextValue = {
    error,
    loading,
    prices: data ?? {},
    refetch,
  }

  return (
    <AssetPriceContext.Provider value={value}>
      {children}
    </AssetPriceContext.Provider>
  )
}

export function useAssetPrices(): AssetPriceContextValue {
  return useContext(AssetPriceContext)
}

export function useAssetPrice(assetId: AssetId): number | null {
  return useAssetPrices().prices[assetId] ?? null
}
