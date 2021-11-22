import algosdk from "algosdk"
import { useEffect, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { PageContent } from "components/PageContent"
import { useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { useAccountInfo } from "hooks/useAccountInfo"
import { useAssetInfo } from "hooks/useAssetInfo"
import { useParamState } from "hooks/useParamState"
import { AssetId } from "lib/algo/Asset"
import { printDecimals, readDecimals } from "lib/utils/int"
import { DefaultLogger } from "lib/utils/logger"
import { RouteParam } from "lib/utils/navigation"

export interface AssetDisplayProps {
  amount: number | null
  assetId: AssetId
}

export function AssetDisplay({ amount, assetId }: AssetDisplayProps) {
  const { data: asset } = useAssetInfo(assetId)

  const unitName = asset?.params["unit-name"]

  const strAmount =
    amount === null || asset === null
      ? "..."
      : printDecimals(amount, asset.params.decimals)

  return <span>{unitName ? `${strAmount} ${unitName}` : strAmount}</span>
}

export interface AssetSelectOptionProps {
  assetId: AssetId
}

export function AssetSelectOption({ assetId }: AssetSelectOptionProps) {
  const { data: asset } = useAssetInfo(assetId)

  return (
    <option
      label={asset?.params.name ?? String(assetId)}
      value={String(assetId)}
    />
  )
}

export interface AssetSelectProps {
  assetIds: AssetId[]
  disabled?: boolean
  onChange: (assetId: AssetId) => unknown
  value: AssetId
}

export function AssetSelect({
  assetIds,
  onChange,
  value,
  ...selectProps
}: AssetSelectProps) {
  return (
    <select
      onChange={e => onChange(Number(e.target.value))}
      value={String(value)}
      {...selectProps}
    >
      {assetIds.map(assetId => (
        <AssetSelectOption assetId={assetId} key={assetId} />
      ))}
    </select>
  )
}

export interface AmountSelectProps {
  decimals: number
  disabled?: boolean
  max?: number
  onChange: (amount: number) => unknown
  unit?: string
  value: number
}

export function AmountSelect({
  decimals,
  disabled = false,
  unit,
  max,
  onChange,
  value,
  ...inputProps
}: AmountSelectProps) {
  const [inputValue, setInputValue] = useState(printDecimals(0, decimals))

  return (
    <div>
      <input
        disabled={disabled}
        min={0}
        onBlur={() => setInputValue(printDecimals(value, decimals))}
        onFocus={e => e.target.select()}
        onChange={e => {
          setInputValue(e.target.value)
          onChange(readDecimals(e.target.value, decimals))
        }}
        step={1}
        type="number"
        value={inputValue}
        {...inputProps}
      />
      {!!unit && <span>{unit}</span>}
      {max !== undefined && (
        <button
          disabled={disabled || value === max}
          onClick={() => {
            setInputValue(printDecimals(max, decimals))
            onChange(max)
          }}
        >
          Max
        </button>
      )}
    </div>
  )
}

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
        <select
          onChange={e => {
            setFrom(e.target.value)
            setAssetId(null)
            setAmount(null)
          }}
          value={from ?? undefined}
        >
          {accounts
            .filter(account => account.key)
            .map(account => (
              <option
                key={account.address}
                label={
                  account.name
                    ? `${account.name} (${account.address})`
                    : account.address
                }
                value={account.address}
              />
            ))}
        </select>
        {fromError && <div>{fromError.message}</div>}
      </div>
      <div>
        <p>To:</p>
        <select
          onChange={e => {
            setTo(e.target.value !== "other" ? e.target.value : null)
            setAssetId(null)
            setAmount(null)
          }}
          value={
            to && accounts.some(account => account.address === to)
              ? to
              : "other"
          }
        >
          {accounts.map(account => (
            <option
              key={account.address}
              label={
                account.name
                  ? `${account.name} (${account.address})`
                  : account.address
              }
              value={account.address}
            />
          ))}
          <option label="Other..." value="other" />
        </select>
        {accounts.every(account => account.address !== to) && (
          <input
            onChange={e => setTo(e.target.value)}
            placeholder="Select address"
            type="text"
            value={to ?? ""}
          />
        )}
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
        {!isToOptedInAssetId && (
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
        disabled={!fromAccount || !toAccount || !asset || !isAbleToConfirm}
        label="Confirm"
        onClick={() => DefaultLogger.warn("Not implemented")}
      />
    </PageContent>
  )
}
