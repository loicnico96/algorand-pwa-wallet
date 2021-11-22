import algosdk from "algosdk"
import { useCallback, useEffect } from "react"
import { toast } from "react-toastify"

import { AsyncButton } from "components/AsyncButton"
import { AccountSelect } from "components/Form/AccountSelect"
import { AmountSelect } from "components/Form/AmountSelect"
import { AssetDisplay } from "components/Form/AssetDisplay"
import { AssetSelect } from "components/Form/AssetSelect"
import { PageContent } from "components/PageContent"
import { useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { useTransactionContext } from "context/TransactionContext"
import { useAccountAssetIds } from "hooks/useAccountAssetIds"
import { useAccountBalance } from "hooks/useAccountBalance"
import { useAccountInfo } from "hooks/useAccountInfo"
import { useAccountMinBalance } from "hooks/useAccountMinBalance"
import { useAssetInfo } from "hooks/useAssetInfo"
import { useParamState } from "hooks/useParamState"
import { useTransactionParams } from "hooks/useTransactionParams"
import { createTransferTransaction } from "lib/algo/transactions/Transfer"
import { printDecimals } from "lib/utils/int"
import { RouteParam } from "lib/utils/navigation"

export default function SendPage() {
  const { accounts } = useAddressBook()
  const { config } = useNetworkContext()
  const { refetch: refetchParams } = useTransactionParams()
  const { signTransaction } = useTransactionContext()

  const nativeAssetId = config.native_asset.index

  const [fromParam, setFromParam] = useParamState(RouteParam.ADDRESS_FROM)
  const isValidFrom = !!fromParam && algosdk.isValidAddress(fromParam)
  const fromAddress = isValidFrom ? fromParam : null

  const { data: fromAccount, error: fromAccountError } =
    useAccountInfo(fromAddress)

  const [toParam, setToParam] = useParamState(RouteParam.ADDRESS_TO)
  const isValidTo = !!toParam && algosdk.isValidAddress(toParam)
  const toAddress = isValidTo ? toParam : null

  const { data: toAccount, error: toAccountError } = useAccountInfo(toAddress)

  const [assetIdParam, setAssetIdParam] = useParamState(RouteParam.ASSET_ID)
  const assetId = assetIdParam?.match(/^[0-9]+$/)
    ? Number(assetIdParam)
    : nativeAssetId

  const { data: asset, error: assetError } = useAssetInfo(assetId)

  const [amountParam, setAmountParam] = useParamState(RouteParam.AMOUNT)
  const amount = amountParam?.match(/^[0-9]+$/) ? Number(amountParam) : 0

  const [noteParam, setNoteParam] = useParamState(RouteParam.NOTE)
  const note = noteParam ?? ""

  useEffect(() => {
    if (assetIdParam !== null && !assetIdParam.match(/^[0-9]+$/)) {
      setAssetIdParam(null)
    }
  }, [assetIdParam, setAssetIdParam])

  useEffect(() => {
    if (amountParam !== null && !amountParam.match(/^[0-9]+$/)) {
      setAmountParam(null)
    }
  }, [amountParam, setAmountParam])

  const fromAssetIds = useAccountAssetIds(fromAccount)
  const toAssetIds = useAccountAssetIds(toAccount)
  const isToOptedInAsset = toAssetIds.includes(assetId)

  const assetBalance = useAccountBalance(fromAccount, assetId)
  const nativeBalance = useAccountBalance(fromAccount, nativeAssetId)
  const nativeLocked = useAccountMinBalance(fromAccount)

  const nativeFee = config.params.MinTxnFee
  const nativeAvailable = Math.max(0, nativeBalance - nativeLocked - nativeFee)

  const assetAvailable =
    assetId === nativeAssetId ? nativeAvailable : assetBalance

  const isSufficientFunds = amount <= assetAvailable

  const isAbleToSubmit =
    isValidFrom && isValidTo && isToOptedInAsset && isSufficientFunds

  const onSubmit = useCallback(async () => {
    if (!fromAddress || !toAddress || !asset) {
      return
    }

    const transaction = createTransferTransaction(config, {
      amount,
      assetId,
      note,
      params: await refetchParams(),
      receiver: toAddress,
      sender: fromAddress,
    })

    const transactionId = await signTransaction(transaction)

    if (transactionId !== null) {
      toast.info(
        `Sending ${printDecimals(amount, asset.params.decimals)} ${
          asset.params["unit-name"]
        } to ${toAddress}...`
      )
    }
  }, [
    amount,
    config,
    refetchParams,
    asset,
    assetId,
    note,
    fromAddress,
    toAddress,
    signTransaction,
  ])

  return (
    <PageContent>
      <div>
        <p>From:</p>
        <AccountSelect
          accounts={accounts.filter(account => account.key)}
          onChange={setFromParam}
          value={fromParam ?? ""}
        />
        {fromAccountError && <div>{fromAccountError.message}</div>}
      </div>
      <div>
        <p>To:</p>
        <AccountSelect
          accounts={accounts}
          allowManual
          onChange={setToParam}
          value={toParam ?? ""}
        />
        {toAccountError && <div>{toAccountError.message}</div>}
      </div>
      <div>
        <p>Asset:</p>
        <AssetSelect
          assetIds={fromAssetIds}
          disabled={!fromAccount}
          onChange={id =>
            setAssetIdParam(id === nativeAssetId ? null : String(id))
          }
          value={assetId}
        />
        {!!toAccount && !isToOptedInAsset && (
          <div>Recipient has not opted in this asset.</div>
        )}
        {assetError && <div>{assetError.message}</div>}
      </div>
      <div>
        <p>Amount:</p>
        <div>
          Available: <AssetDisplay amount={assetAvailable} assetId={assetId} />
        </div>
        {assetId === nativeAssetId && (
          <div>
            Locked:{" "}
            <AssetDisplay amount={nativeLocked} assetId={nativeAssetId} />
          </div>
        )}
        <AmountSelect
          decimals={
            asset?.params.decimals ?? config.native_asset.params.decimals
          }
          disabled={!fromAccount}
          max={assetAvailable}
          onChange={value => setAmountParam(String(value))}
          unit={asset?.params["unit-name"]}
          value={Number(amount)}
        />
        {!isSufficientFunds && <div>Not enough funds.</div>}
      </div>
      <div>
        <p>Fee:</p>
        <div>
          Balance:{" "}
          <AssetDisplay amount={nativeBalance} assetId={nativeAssetId} />
        </div>
        <div>
          Fee: <AssetDisplay amount={nativeFee} assetId={nativeAssetId} />
        </div>
      </div>
      <div>
        <p>Note:</p>
        <input
          onChange={e => setNoteParam(e.target.value)}
          placeholder="Note (optional)"
          type="text"
          value={note}
        />
      </div>
      <AsyncButton
        disabled={!fromAccount || !asset || !isAbleToSubmit}
        label="Confirm"
        onClick={onSubmit}
      />
    </PageContent>
  )
}
