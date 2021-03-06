import styled from "@emotion/styled"

import { Button } from "components/Primitives/Button"
import { Card } from "components/Primitives/Card"
import { useNetworkContext } from "context/NetworkContext"
import { useAccountBalance } from "hooks/api/useAccountBalance"
import { useAccountInfo } from "hooks/api/useAccountInfo"
import { useAssetPrices } from "hooks/api/useAssetPrices"
import { ContactData } from "lib/storage/contacts"
import { toClipboard } from "lib/utils/clipboard"
import { printDecimals } from "lib/utils/int"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

export interface AccountListItemProps {
  address: string
  data: ContactData
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

export function AccountListItem({ address, data }: AccountListItemProps) {
  const { config } = useNetworkContext()
  const { data: account } = useAccountInfo(address)
  const { data: prices } = useAssetPrices()

  const algoId = config.native_asset.index
  const algoInfo = prices ? prices[algoId] : null
  const algoBalance = useAccountBalance(account, algoId)
  const algoValue = algoInfo?.decimals
    ? (algoInfo.price * algoBalance) / 10 ** algoInfo.decimals
    : null

  const totalValue = prices
    ? account?.assets?.reduce((total, asset) => {
        const priceInfo = prices[asset.assetId]
        return priceInfo?.decimals
          ? total + (asset.amount * priceInfo.price) / 10 ** priceInfo.decimals
          : total
      }, algoValue ?? 0) ?? algoValue
    : null

  const accountUrl = replaceParams(Route.ACCOUNTS_VIEW, {
    [RouteParam.ADDRESS]: address,
  })

  return (
    <Card href={accountUrl} title={data.name ?? address}>
      <ContainerRow>
        <Title>{data.name ? `${data.name} (${address})` : address}</Title>
        <Button
          label="Copy"
          onClick={() => toClipboard(address)}
          title="Copy address to clipboard"
        />
      </ContainerRow>
      <ContainerRow>
        {printDecimals(algoBalance, config.native_asset.params.decimals)}{" "}
        {config.native_asset.params.unitName} ({algoValue?.toFixed(2) ?? "..."}
        $)
      </ContainerRow>
      <ContainerRow>
        {`Portfolio value: ${totalValue?.toFixed(2) ?? "..."}$`}
      </ContainerRow>
    </Card>
  )
}
