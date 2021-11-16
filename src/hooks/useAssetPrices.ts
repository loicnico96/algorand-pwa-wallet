import { ALGO_NETWORK } from "lib/utils/environment"
import { fetchJson } from "lib/utils/fetchJson"
import { useMemo } from "react"
import useSWR from "swr"

const ASSET_PRICE_URL = `https://${ALGO_NETWORK}.analytics.tinyman.org/api/v1/current-asset-prices`

export function useAssetPrices() {
  const { data, error, isValidating, mutate } = useSWR(`/asset-prices`, () =>
    fetchJson<{ [K in string]: { price: string } }>(ASSET_PRICE_URL)
  )

  const prices = useMemo(() => {
    const result: { [K in number]?: number } = {}

    for (const assetId in data) {
      result[Number(assetId)] = Number(data[assetId].price)
    }

    return result
  }, [data])

  return {
    prices,
    error,
    isValidating,
    mutate,
  }
}
