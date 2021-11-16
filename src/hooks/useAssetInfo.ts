import { getAssetInfo } from "lib/algo/Asset"
import useSWR from "swr"

export function useAssetInfo(assetId: number) {
  const {
    data: asset,
    error,
    isValidating,
    mutate,
  } = useSWR(`/asset/${assetId}`, () => getAssetInfo(assetId))

  return {
    asset,
    error,
    isValidating,
    mutate,
  }
}
