import styled from "@emotion/styled"

import { useNetworkContext } from "context/NetworkContext"
import { useAccountBalance } from "hooks/api/useAccountBalance"
import { useAccountInfo } from "hooks/api/useAccountInfo"
import { useAssetPrices } from "hooks/api/useAssetPrices"
import { ContactData } from "lib/storage/contacts"
import { toClipboard } from "lib/utils/clipboard"
import { printDecimals } from "lib/utils/int"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

import { AsyncButton } from "./AsyncButton"
import { Link } from "./Link"

export interface AccountListItemProps {
  address: string
  data: ContactData
}

const Container = styled.div`
  background-color: #ccc;
  border: 2px solid #444;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 16px;
`

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
        const priceInfo = prices[asset["asset-id"]]
        return priceInfo?.decimals
          ? total + (asset.amount * priceInfo.price) / 10 ** priceInfo.decimals
          : total
      }, algoValue ?? 0) ?? algoValue
    : null

  const accountUrl = replaceParams(Route.ACCOUNTS_VIEW, {
    [RouteParam.ADDRESS]: address,
  })

  return (
    <Link href={accountUrl} title={data.name ?? address}>
      <Container>
        <ContainerRow>
          <Title>{data.name ? `${data.name} (${address})` : address}</Title>
          <AsyncButton
            label="Copy"
            onClick={() => toClipboard(address)}
            title="Copy address to clipboard"
          />
        </ContainerRow>
        <ContainerRow>
          {printDecimals(algoBalance, config.native_asset.params.decimals)}{" "}
          {config.native_asset.params["unit-name"]} (
          {algoValue?.toFixed(2) ?? "..."}$)
        </ContainerRow>
        <ContainerRow>
          {`Portfolio value: ${totalValue?.toFixed(2) ?? "..."}$`}
        </ContainerRow>
      </Container>
    </Link>
  )
}
