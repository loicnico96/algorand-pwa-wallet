import { useAssetInfo } from "hooks/useAssetInfo"
import { useAssetPrices } from "hooks/useAssetPrices"

import { Asset } from "./Asset"

export type StandardAssetProps = {
  amount: number
  assetId: number
  frozen?: boolean
}

export function StandardAsset({ amount, assetId, frozen }: StandardAssetProps) {
  const { asset } = useAssetInfo(assetId)
  const { prices } = useAssetPrices()

  if (!asset) {
    return <pre>Loading...</pre>
  }

  return (
    <Asset
      amount={amount}
      clawback={Boolean(asset.params.clawback)}
      decimals={asset.params.decimals ?? NaN}
      freeze={Boolean(asset.params.freeze)}
      frozen={frozen}
      name={asset.params.name ?? String(assetId)}
      price={prices[assetId] ?? NaN}
      unit={asset.params["unit-name"]}
      url={asset.params.url}
    />
  )
}
