import { useAssetPrices } from "./useAssetPrices"

export function useAssetPrice(assetId: number | null): number | null {
  const { data } = useAssetPrices()
  return assetId ? data?.[assetId] ?? null : null
}
