import { fetchJson } from "lib/utils/fetchJson"
import useSWR from "swr"
import { useNetworkContext } from "context/NetworkContext"

export interface UseAssetInfoResult {
  prices: Partial<Record<number, number>>
  error: Error | null
  isValidating: boolean
  revalidate: () => void
}

export function useAssetPrices() {
  const { config, network } = useNetworkContext()

  const { data, error, isValidating, mutate } = useSWR(
    `${network}:prices`,
    async () => {
      const prices: Partial<Record<number, number>> = {}
      const assets = await fetchJson<Record<string, { price: number }>>(
        config.prices_api.url
      )

      for (const assetId in assets) {
        prices[Number(assetId)] = Number(assets[assetId].price)
      }

      return prices
    }
  )

  return {
    prices: data ?? {},
    error,
    isValidating,
    revalidate: mutate,
  }
}
