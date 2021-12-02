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
  const data = useAssetPrice(assetId)

  return (
    <Asset
      amount={amount}
      clawback={Boolean(asset?.params.clawback)}
      decimals={asset?.params.decimals ?? data?.decimals ?? NaN}
      freeze={Boolean(asset?.params.freeze)}
      frozen={frozen}
      name={asset?.params.name ?? String(assetId)}
      price={data?.price ?? NaN}
      unit={asset?.params.unitName}
      url={asset?.params.url}
    />
  )
}
