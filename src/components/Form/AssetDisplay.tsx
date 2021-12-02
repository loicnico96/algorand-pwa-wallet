import { useAssetInfo } from "hooks/api/useAssetInfo"
import { printDecimals } from "lib/utils/int"

export interface AssetDisplayProps {
  amount: number | null
  assetId: number
}

export function AssetDisplay({ amount, assetId }: AssetDisplayProps) {
  const { data: asset } = useAssetInfo(assetId)

  const unitName = asset?.params.unitName

  const strAmount =
    amount === null || asset === null
      ? "..."
      : printDecimals(amount, asset.params.decimals)

  return <span>{unitName ? `${strAmount} ${unitName}` : strAmount}</span>
}
