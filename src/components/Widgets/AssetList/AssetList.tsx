import { useMemo } from "react"

import { CardList } from "components/Primitives/CardList"
import { AccountAsset } from "lib/algo/Account"

import { AssetListItem } from "./AssetListItem"

export interface AssetListProps {
  assets: AccountAsset[]
}

export function AssetList({ assets }: AssetListProps) {
  const sortedAssets = useMemo(
    () =>
      assets
        .slice()
        .sort((assetA, assetB) => assetA["asset-id"] - assetB["asset-id"]),
    [assets]
  )

  return (
    <CardList>
      {sortedAssets.map(asset => (
        <AssetListItem asset={asset} key={asset["asset-id"]} />
      ))}
    </CardList>
  )
}
