import { useEffect } from "react"

import { AssetSelectOption } from "./AssetSelectOption"
import { InputSelect } from "./Primitives/InputSelect"

export interface AssetSelectProps {
  assets: {
    assetId: number
    name?: string
  }[]
  disabled?: boolean
  label?: string
  name: string
  onChange: (assetId: number) => unknown
  value: number
}

export function AssetSelect({
  assets,
  name,
  onChange,
  value,
  ...selectProps
}: AssetSelectProps) {
  assets.sort((a, b) => a.assetId - b.assetId)

  useEffect(() => {
    if (!assets.some(asset => asset.assetId === value)) {
      onChange(assets[0].assetId)
    }
  }, [assets, value, onChange])

  return (
    <InputSelect
      id={`input-${name}`}
      name={name}
      onChange={newValue => onChange(Number(newValue))}
      value={String(value)}
      {...selectProps}
    >
      {assets.map(asset => (
        <AssetSelectOption
          assetId={asset.assetId}
          key={asset.assetId}
          name={asset.name}
        />
      ))}
    </InputSelect>
  )
}
