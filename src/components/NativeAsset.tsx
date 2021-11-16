import { useAssetPrices } from "hooks/useAssetPrices"

import { Asset } from "./Asset"

export const ALGO_ASSET_DECIMALS = 6
export const ALGO_ASSET_NAME = "Algo"
export const ALGO_ASSET_UNIT = "ALGO"
export const ALGO_ASSET_URL = "https://algorand.foundation"

export type NativeAssetProps = {
  amount: number
}

export function NativeAsset({ amount }: NativeAssetProps) {
  const { prices } = useAssetPrices()

  return (
    <Asset
      amount={amount}
      decimals={ALGO_ASSET_DECIMALS}
      name={ALGO_ASSET_NAME}
      price={prices[0] ?? NaN}
      unit={ALGO_ASSET_UNIT}
      url={ALGO_ASSET_URL}
      verified
    />
  )
}
