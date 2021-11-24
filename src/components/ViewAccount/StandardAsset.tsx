import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrice } from "hooks/api/useAssetPrice"

import { Asset } from "./Asset"

export type StandardAssetProps = {
  amount: number
  assetId: number
  frozen?: boolean
}

export function StandardAsset({ amount, assetId, frozen }: StandardAssetProps) {
  const { data: asset } = useAssetInfo(assetId)
  const price = useAssetPrice(assetId)

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
      price={price ?? NaN}
      unit={asset.params["unit-name"]}
      url={asset.params.url}
    />
  )
}
