import { useNetworkContext } from "context/NetworkContext"
import { fetchJson } from "lib/utils/fetchJson"
import { useQuery, UseQueryResult } from "./useQuery"

export interface TinymanAssetData {
  decimals: number
  id: string
  is_liquidity_token: boolean
  is_verified: boolean
  name: string
  total_amount: number
  unit_name: string
  url: string
}

export interface TinymanPoolData {
  address: string
  asset_1: TinymanAssetData
  asset_2: TinymanAssetData
  creation_round: string
  current_asset_1_reserves: string
  current_asset_1_reserves_in_usd: string
  current_asset_2_reserves: string
  current_asset_2_reserves_in_usd: string
  liquidity_asset: TinymanAssetData
}

export interface TinymanAssetPrices {
  [assetId: string]: {
    price: number
    pools: TinymanPoolData[]
  }
}

export interface AssetData {
  decimals?: number
  price: number
}

export type AssetPrices = { [assetId in number]?: AssetData }

export function useAssetPrices(): UseQueryResult<AssetPrices> {
  const { config } = useNetworkContext()

  return useQuery(
    "api/assets/prices",
    async () => {
      const prices: AssetPrices = {}
      const assets = await fetchJson<TinymanAssetPrices>(config.prices_api.url)

      for (const assetId in assets) {
        const { pools, price } = assets[assetId]

        let assetData: AssetData = { price }
        for (const pool of pools) {
          if (pool.asset_1.id === assetId) {
            assetData = { decimals: pool.asset_1.decimals, price }
            break
          }

          if (pool.asset_2.id === assetId) {
            assetData = { decimals: pool.asset_2.decimals, price }
            break
          }
        }

        // Tinyman prices API uses 0 for Algo
        if (Number(assetId) === 0) {
          prices[config.native_asset.index] = assetData
        } else {
          prices[Number(assetId)] = assetData
        }
      }

      return prices
    },
    { immutable: true }
  )
}
