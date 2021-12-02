import styled from "@emotion/styled"
import { useState } from "react"

import { Button } from "components/Primitives/Button"
import { Card } from "components/Primitives/Card"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrice } from "hooks/api/useAssetPrice"
import { AccountAsset, AssetInfo } from "lib/algo/api"
import { printDecimals } from "lib/utils/int"

export interface AssetListItemProps {
  asset: AccountAsset
  onOptOut?: (assetId: number, assetInfo: AssetInfo) => Promise<void>
}

const ContainerRow = styled.div`
  display: flex;
`

const Title = styled.div`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export function AssetListItem({ asset, onOptOut }: AssetListItemProps) {
  const { amount, assetId, isFrozen } = asset
  const { data: assetInfo } = useAssetInfo(assetId)
  const assetPrice = useAssetPrice(assetId)

  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      aria-expanded={expanded}
      onBlur={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      title={expanded ? undefined : "Click to expand"}
    >
      <ContainerRow>
        <Title>{`${assetInfo?.params.name ?? "..."} (${assetId})`}</Title>
        {onOptOut && assetInfo && (
          <Button
            disabled={amount !== 0 || isFrozen}
            label="Remove"
            onClick={() => onOptOut(assetId, assetInfo)}
            title={
              amount !== 0
                ? "Cannot remove an asset with funds"
                : isFrozen
                ? "Asset is frozen"
                : "Remove asset"
            }
          />
        )}
      </ContainerRow>
      <ContainerRow>
        {`${
          assetInfo ? printDecimals(amount, assetInfo.params.decimals) : "..."
        } ${assetInfo?.params.unitName ?? "..."}`}
      </ContainerRow>
      <ContainerRow>
        {`${
          assetInfo && assetPrice
            ? `${(
                (amount * (assetPrice?.price ?? 0)) /
                10 ** assetInfo.params.decimals
              ).toFixed(2)}`
            : "..."
        } $`}
      </ContainerRow>
      {expanded && <>Expanded</>}
    </Card>
  )
}
