import algosdk from "algosdk"
import { useEffect } from "react"

import { AsyncButton } from "components/AsyncButton"
import { AccountSelect } from "components/Form/AccountSelect"
import { AmountSelect } from "components/Form/AmountSelect"
import { AssetDisplay } from "components/Form/AssetDisplay"
import { AssetSelect } from "components/Form/AssetSelect"
import { PageContent } from "components/PageContent"
import { useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { useAccountInfo } from "hooks/useAccountInfo"
import { useAssetInfo } from "hooks/useAssetInfo"
import { useParamState } from "hooks/useParamState"
import { AssetId } from "lib/algo/Asset"
import { DefaultLogger } from "lib/utils/logger"
import { RouteParam } from "lib/utils/navigation"

export default function SendPage() {
  const [from, setFrom] = useParamState(RouteParam.ADDRESS_FROM)
  const [to, setTo] = useParamState(RouteParam.ADDRESS_TO)
  const [amount, setAmount] = useParamState(RouteParam.AMOUNT)
  const [assetId, setAssetId] = useParamState(RouteParam.ASSET_ID)

  const isValidFrom = !!from && algosdk.isValidAddress(from)
  const isValidTo = !!to && algosdk.isValidAddress(to)

  useEffect(() => {
    if (amount !== null && !amount?.match(/^[0-9]+$/)) {
      setAmount(null)
    }
  }, [amount, setAmount])

  useEffect(() => {
    if (assetId !== null && !assetId?.match(/^[0-9]+$/)) {
      setAssetId(null)
    }
  }, [assetId, setAssetId])

  const { accounts } = useAddressBook()
  const { config } = useNetworkContext()

  const { data: fromAccount, error: fromError } = useAccountInfo(
    isValidFrom ? from : null
  )

  const { data: toAccount, error: toError } = useAccountInfo(
    isValidTo ? to : null
  )

  const fromAssets: AssetId[] = [
    config.native_asset.index,
    ...(fromAccount?.assets?.map(asset => asset["asset-id"]) ?? []),
  ]

  const toAssets: AssetId[] = [
    config.native_asset.index,
    ...(toAccount?.assets?.map(asset => asset["asset-id"]) ?? []),
  ]

  const realAssetId = Number(assetId) || config.native_asset.index
  const isToOptedInAssetId = toAssets.includes(Number(realAssetId))

  const { data: asset, error: assetError } = useAssetInfo(Number(realAssetId))

  const nativeBalance = fromAccount?.amount ?? 0

  const nativeAvailable = Math.max(nativeBalance - config.params.MinTxnFee, 0)

  const assetAvailable =
    realAssetId === config.native_asset.index
      ? nativeAvailable
      : fromAccount?.assets?.find(a => a["asset-id"] === realAssetId)?.amount ??
        0

  const isAbleToConfirm =
    isValidFrom &&
    isValidTo &&
    isToOptedInAssetId &&
    Number(amount) <= assetAvailable

  return (
    <PageContent>
      <div>
        <p>From:</p>
        <AccountSelect
          accounts={accounts.filter(account => account.key)}
          onChange={setFrom}
          value={from ?? ""}
        />
        {fromError && <div>{fromError.message}</div>}
      </div>
      <div>
        <p>To:</p>
        <AccountSelect
          accounts={accounts}
          allowManual
          onChange={setTo}
          value={to ?? ""}
        />
        {toError && <div>{toError.message}</div>}
      </div>
      <div>
        <p>Asset:</p>
        <AssetSelect
          assetIds={fromAssets}
          disabled={!fromAccount}
          onChange={id =>
            setAssetId(id === config.native_asset.index ? null : String(id))
          }
          value={realAssetId}
        />
        {!!toAccount && !isToOptedInAssetId && (
          <div>Recipient has not opted in this asset.</div>
        )}
        {assetError && <div>{assetError.message}</div>}
      </div>
      <div>
        <p>Amount:</p>
        <div>
          Available:{" "}
          <AssetDisplay amount={assetAvailable} assetId={realAssetId} />
        </div>
        <AmountSelect
          decimals={
            asset?.params.decimals ?? config.native_asset.params.decimals
          }
          disabled={!fromAccount}
          max={assetAvailable}
          onChange={value => setAmount(String(value))}
          unit={asset?.params["unit-name"]}
          value={Number(amount)}
        />
        {Number(amount) > assetAvailable && <div>Not enough funds.</div>}
      </div>
      <div>
        <p>Fee:</p>
        <p>
          Balance:{" "}
          <AssetDisplay
            amount={nativeBalance}
            assetId={config.native_asset.index}
          />
        </p>
        <p>
          Fee:{" "}
          <AssetDisplay
            amount={config.params.MinTxnFee}
            assetId={config.native_asset.index}
          />
        </p>
      </div>
      <AsyncButton
        disabled={!fromAccount || !asset || !isAbleToConfirm}
        label="Confirm"
        onClick={() => DefaultLogger.warn("Not implemented")}
      />
    </PageContent>
  )
}
