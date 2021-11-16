import { ALGO_NETWORK } from "lib/utils/environment"
import { fetchJson } from "lib/utils/fetchJson"
import { useMemo } from "react"
import useSWR from "swr"
import networks from "config/networks.json"

const ASSET_PRICE_URL = networks[ALGO_NETWORK].prices_api

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
