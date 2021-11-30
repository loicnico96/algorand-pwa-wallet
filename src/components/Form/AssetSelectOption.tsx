export interface AssetSelectOptionProps {
  assetId: number
  name?: string
}

export function AssetSelectOption({ assetId, name }: AssetSelectOptionProps) {
  return (
    <option
      label={name ? `${name} (${assetId})` : String(assetId)}
      value={String(assetId)}
    />
  )
}
