import { useAssetInfo } from "hooks/useAssetInfo"

export interface AssetSelectOptionProps {
  assetId: number
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
