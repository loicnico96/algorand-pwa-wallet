import { AssetData, useAssetPrices } from "./useAssetPrices"

export function useAssetPrice(assetId: number | null): AssetData | null {
  const { data } = useAssetPrices()
  return assetId ? data?.[assetId] ?? null : null
}
