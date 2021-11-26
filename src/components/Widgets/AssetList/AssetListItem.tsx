import styled from "@emotion/styled"

import { AsyncButton } from "components/AsyncButton"
import { Card } from "components/Primitives/Card"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrice } from "hooks/api/useAssetPrice"
import { AccountAsset } from "lib/algo/Account"
import { AssetInfo } from "lib/algo/Asset"
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
  const assetId = asset["asset-id"]
  const { data: assetInfo } = useAssetInfo(assetId)
  const assetPrice = useAssetPrice(assetId)

  return (
    <Card title={assetInfo?.params.name}>
      <ContainerRow>
        <Title>{`${assetInfo?.params.name ?? "..."} (${assetId})`}</Title>
        {onOptOut && assetInfo && (
          <AsyncButton
            disabled={asset.amount !== 0 || asset["is-frozen"]}
            label="Remove"
            onClick={() => onOptOut(assetId, assetInfo)}
            title={
              asset.amount !== 0
                ? "Cannot remove an asset with funds"
                : asset["is-frozen"]
                ? "Asset is frozen"
                : "Remove asset"
            }
          />
        )}
      </ContainerRow>
      <ContainerRow>
        {`${
          assetInfo
            ? printDecimals(asset.amount, assetInfo.params.decimals)
            : "..."
        } ${assetInfo?.params["unit-name"] ?? "..."}`}
      </ContainerRow>
      <ContainerRow>
        {`${
          assetInfo && assetPrice
            ? `${(
                (asset.amount * (assetPrice?.price ?? 0)) /
                10 ** assetInfo.params.decimals
              ).toFixed(2)}`
            : "..."
        } $`}
      </ContainerRow>
    </Card>
  )
}
