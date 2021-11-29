import { AssetSelectOption } from "./AssetSelectOption"
import { InputSelect } from "./Primitives/InputSelect"

export interface AssetSelectProps {
  assetIds: number[]
  disabled?: boolean
  label?: string
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
    <InputSelect
      id={`input-${name}`}
      name={name}
      onChange={newValue => onChange(Number(newValue))}
      value={String(value)}
      {...selectProps}
    >
      {assetIds.map(assetId => (
        <AssetSelectOption assetId={assetId} key={assetId} />
      ))}
    </InputSelect>
  )
}
