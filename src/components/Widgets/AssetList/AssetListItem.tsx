import styled from "@emotion/styled"

import { Card } from "components/Primitives/Card"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrice } from "hooks/api/useAssetPrice"
import { AccountAsset } from "lib/algo/Account"
import { printDecimals } from "lib/utils/int"

export interface AssetListItemProps {
  asset: AccountAsset
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

export function AssetListItem({ asset }: AssetListItemProps) {
  const assetId = asset["asset-id"]
  const { data: assetInfo } = useAssetInfo(assetId)
  const assetPrice = useAssetPrice(assetId)

  return (
    <Card title={assetInfo?.params.name}>
      <ContainerRow>
        <Title>{`${assetInfo?.params.name ?? "..."} (${assetId})`}</Title>
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
