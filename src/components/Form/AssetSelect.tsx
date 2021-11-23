import { AssetSelectOption } from "./AssetSelectOption"

export interface AssetSelectProps {
  assetIds: number[]
  disabled?: boolean
  onChange: (assetId: number) => unknown
  value: number
}

export function AssetSelect({
  assetIds,
  onChange,
  value,
  ...selectProps
}: AssetSelectProps) {
  return (
    <select
      onChange={e => onChange(Number(e.target.value))}
      value={String(value)}
      {...selectProps}
    >
      {assetIds.map(assetId => (
        <AssetSelectOption assetId={assetId} key={assetId} />
      ))}
    </select>
  )
}
