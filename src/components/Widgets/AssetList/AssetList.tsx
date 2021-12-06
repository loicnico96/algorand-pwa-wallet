import { useMemo } from "react"

import { Card } from "components/Primitives/Card"
import { CardList } from "components/Primitives/CardList"
import { AccountAsset, AssetInfo } from "lib/algo/api"

import { AssetListItem } from "./AssetListItem"

export interface AssetListProps {
  onOptIn?: () => Promise<void>
  onOptOut?: (assetId: number, assetInfo: AssetInfo) => Promise<void>
  assets: AccountAsset[]
}

export function AssetList({ assets, onOptIn, onOptOut }: AssetListProps) {
  const sortedAssets = useMemo(
    () =>
      assets.slice().sort((assetA, assetB) => assetA.assetId - assetB.assetId),
    [assets]
  )

  return (
    <CardList>
      {sortedAssets.map(asset => (
        <AssetListItem asset={asset} key={asset.assetId} onOptOut={onOptOut} />
      ))}
      {onOptIn && (
        <Card title="Add new Standard Asset" onClick={onOptIn}>
          Add
        </Card>
      )}
    </CardList>
  )
}
