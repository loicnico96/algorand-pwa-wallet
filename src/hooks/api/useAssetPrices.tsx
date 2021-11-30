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

export interface PoolInfo {
  address: string
  asset1: {
    id: number
    reserves: number
  }
  asset2: {
    id: number
    reserves: number
  }
}

export interface AssetData extends TinymanAssetData {
  pools: {
    [otherAssetId in number]?: PoolInfo
  }
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

        for (const pool of pools) {
          const poolInfo: PoolInfo = {
            address: pool.address,
            asset1: {
              id: Number(pool.asset_1.id),
              reserves: Number(pool.current_asset_1_reserves),
            },
            asset2: {
              id: Number(pool.asset_2.id),
              reserves: Number(pool.current_asset_2_reserves),
            },
          }

          prices[Number(pool.asset_1.id)] = {
            ...pool.asset_1,
            pools: {
              ...prices[Number(pool.asset_1.id)]?.pools,
              [Number(pool.asset_2.id)]: poolInfo,
            },
            price:
              pool.asset_1.id === assetId && price > 0
                ? price
                : prices[Number(pool.asset_1.id)]?.price ?? 0,
          }

          prices[Number(pool.asset_2.id)] = {
            ...pool.asset_2,
            pools: {
              ...prices[Number(pool.asset_2.id)]?.pools,
              [Number(pool.asset_1.id)]: poolInfo,
            },
            price:
              pool.asset_2.id === assetId && price > 0
                ? price
                : prices[Number(pool.asset_2.id)]?.price ?? 0,
          }
        }
      }

      return prices
    },
    { immutable: true }
  )
}
