import { AssetSelectOption } from "./AssetSelectOption"

export interface AssetSelectProps {
  assetIds: number[]
  disabled?: boolean
  name: string
  onChange: (assetId: number) => unknown
  value: number
}

export function AssetSelect({
  assetIds,
  name,
  onChange,
  value,
  ...selectProps
}: AssetSelectProps) {
  assetIds.sort((a, b) => a - b)

  return (
    <select
      name={name}
      id={`input-${name}`}
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
