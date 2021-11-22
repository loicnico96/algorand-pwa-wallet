import { AssetId } from "lib/algo/Asset"

import { AssetSelectOption } from "./AssetSelectOption"

export interface AssetSelectProps {
  assetIds: AssetId[]
  disabled?: boolean
  onChange: (assetId: AssetId) => unknown
  value: AssetId
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
