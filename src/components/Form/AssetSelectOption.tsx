import { useAssetInfo } from "hooks/useAssetInfo"
import { AssetId } from "lib/algo/Asset"

export interface AssetSelectOptionProps {
  assetId: AssetId
}

export function AssetSelectOption({ assetId }: AssetSelectOptionProps) {
  const { data: asset } = useAssetInfo(assetId)

  return (
    <option
      label={asset?.params.name ?? String(assetId)}
      value={String(assetId)}
    />
  )
}
