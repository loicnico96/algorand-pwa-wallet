import { useAssetInfo } from "hooks/useAssetInfo"
import { AssetId } from "lib/algo/Asset"
import { printDecimals } from "lib/utils/int"

export interface AssetDisplayProps {
  amount: number | null
  assetId: AssetId
}

export function AssetDisplay({ amount, assetId }: AssetDisplayProps) {
  const { data: asset } = useAssetInfo(assetId)

  const unitName = asset?.params["unit-name"]

  const strAmount =
    amount === null || asset === null
      ? "..."
      : printDecimals(amount, asset.params.decimals)

  return <span>{unitName ? `${strAmount} ${unitName}` : strAmount}</span>
}
