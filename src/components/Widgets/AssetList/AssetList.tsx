import { useMemo } from "react"

import { Card } from "components/Primitives/Card"
import { CardList } from "components/Primitives/CardList"
import { AccountAsset } from "lib/algo/Account"
import { AssetInfo } from "lib/algo/Asset"

import { AssetListItem } from "./AssetListItem"

export interface AssetListProps {
  onOptIn?: () => Promise<void>
  onOptOut?: (assetId: number, assetInfo: AssetInfo) => Promise<void>
  assets: AccountAsset[]
}

export function AssetList({ assets, onOptIn, onOptOut }: AssetListProps) {
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
        <AssetListItem
          asset={asset}
          key={asset["asset-id"]}
          onOptOut={onOptOut}
        />
      ))}
      {onOptIn && (
        <Card title="Add a new Standard Asset" onClick={onOptIn}>
          Add
        </Card>
      )}
    </CardList>
  )
}
