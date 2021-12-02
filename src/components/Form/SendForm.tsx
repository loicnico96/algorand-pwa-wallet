import algosdk from "algosdk"
import { useCallback } from "react"

import { useNetworkContext } from "context/NetworkContext"
import { useAccountAssetIds } from "hooks/api/useAccountAssetIds"
import { useAccountBalance } from "hooks/api/useAccountBalance"
import { useAccountInfo } from "hooks/api/useAccountInfo"
import { useAccountMinBalance } from "hooks/api/useAccountMinBalance"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrices } from "hooks/api/useAssetPrices"
import { useTransaction } from "hooks/api/useTransaction"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { useIntParamState } from "hooks/navigation/useIntParamState"
import { useParamState } from "hooks/navigation/useParamState"
import { useContacts } from "hooks/storage/useContacts"
import { useAsyncHandler } from "hooks/utils/useAsyncHandler"
import { createAssetTransferTransaction } from "lib/algo/transactions/AssetTransfer"
import { handleGenericError } from "lib/utils/error"
import { printDecimals } from "lib/utils/int"
import { RouteParam } from "lib/utils/navigation"

import { AccountSelect } from "./AccountSelect"
import { AmountSelect } from "./AmountSelect"
import { AssetDisplay } from "./AssetDisplay"
import { AssetSelect } from "./AssetSelect"
import { Form } from "./Primitives/Form"
import { FormSubmit } from "./Primitives/FormSubmit"
import { GroupLabel } from "./Primitives/GroupLabel"
import { InputBase } from "./Primitives/InputBase"
import { InputGroup } from "./Primitives/InputGroup"
import { InputLabel } from "./Primitives/InputLabel"
import { InputTextArea } from "./Primitives/InputTextArea"

export function SendForm() {
  const { data: contacts } = useContacts()
  const { config } = useNetworkContext()
  const { refetch: refetchParams } = useTransactionParams()
  const { sendTransaction } = useTransaction()

  const algoId = config.native_asset.index

  const [amount, setAmount] = useIntParamState(RouteParam.AMOUNT, 0)
  const [assetId, setAssetId] = useIntParamState(RouteParam.ASSET_ID, algoId)
  const [fromParam, setFromParam] = useParamState(RouteParam.ADDRESS_FROM)
  const [toParam, setToParam] = useParamState(RouteParam.ADDRESS_TO)
  const [note, setNote] = useParamState(RouteParam.NOTE)

  const isValidSender = algosdk.isValidAddress(fromParam)
  const senderAddress = isValidSender ? fromParam : null

  const isValidReceiver = algosdk.isValidAddress(toParam)
  const receiverAddress = isValidReceiver ? toParam : null

  const { data: prices } = useAssetPrices()
  const { data: sender, error: senderError } = useAccountInfo(senderAddress)

  const { data: receiver, error: receiverError } =
    useAccountInfo(receiverAddress)

  const { data: asset, error: assetError } = useAssetInfo(assetId)

  const senderAssetIds = useAccountAssetIds(sender)
  const receiverAssetIds = useAccountAssetIds(receiver)

  const minBalance = config.params.MinBalance

  const senderBalance = useAccountBalance(sender, algoId)
  const senderMinBalance = useAccountMinBalance(sender)
  const receiverBalance = useAccountBalance(receiver, algoId)

  // Is the sender funded? (i.e. not an empty account)
  const isSenderFunded = senderBalance >= minBalance
  // Has the recipient opted in to this asset? (always true for native)
  const isReceiverOptedInAsset = receiverAssetIds.includes(assetId)
  // Is the sender able to close their account?
  const isAbleToClose = senderMinBalance === minBalance

  // Minimum transaction fee
  const minFee = config.params.MinTxnFee

  // Sender's available native balance, considering fee and minimum balance
  const algoAvailable = senderBalance - senderMinBalance - minFee
  // Sender's total native balance transferred if closing the account
  const algoCloseAmount = senderBalance - minFee
  // Will this transaction close the sender's account?
  const isClosing = assetId === algoId && amount === algoCloseAmount

  // Sender's total balance in the transferred asset
  const assetBalance = useAccountBalance(sender, assetId)

  // Minimum transfer, required to fund the recipient (native asset only)
  const minAmount =
    assetId === algoId ? Math.max(minBalance - receiverBalance, 0) : 0

  // Maximum transfer, considering fee and minimum balance
  const maxAmount =
    assetId === algoId
      ? Math.max(isAbleToClose ? algoCloseAmount : algoAvailable, 0)
      : assetBalance

  // Does the sender hold enough of the transferred asset?
  const isSufficientFunds =
    assetId === algoId
      ? amount <= algoAvailable || (isAbleToClose && isClosing)
      : amount <= assetBalance

  // If transferring an ASA, does the sender hold enough Algo to pay the fee?
  const isAbleToPayFee = assetId === algoId || algoAvailable >= 0

  // Are all conditions satisfied?
  const isAbleToSubmit =
    sender !== null &&
    receiver !== null &&
    asset !== null &&
    isValidSender &&
    isValidReceiver &&
    isSenderFunded &&
    isReceiverOptedInAsset &&
    isSufficientFunds &&
    isAbleToPayFee &&
    amount >= minAmount &&
    amount <= maxAmount

  const algoDecimals = config.native_asset.params.decimals
  const assetDecimals = asset?.params.decimals ?? algoDecimals
  const assetUnitName = asset?.params.unitName

  const onSubmit = useCallback(async () => {
    if (sender !== null && receiver !== null && asset !== null) {
      const params = await refetchParams()

      const transaction = createAssetTransferTransaction(config, {
        amount,
        assetId,
        close: isClosing,
        note,
        params,
        receiver: receiver.address,
        sender: sender.address,
      })

      await sendTransaction(transaction)
    }
  }, [
    amount,
    asset,
    assetId,
    config,
    isClosing,
    note,
    receiver,
    refetchParams,
    sender,
    sendTransaction,
  ])

  const [onSubmitAsync, isSubmitting] = useAsyncHandler(
    onSubmit,
    handleGenericError
  )

  return (
    <Form onSubmit={onSubmitAsync}>
      <InputGroup group="from">
        <GroupLabel group="from">Sender</GroupLabel>
        <AccountSelect
          accounts={contacts}
          label="Sender"
          name="from"
          onChange={value =>
            Promise.all([setFromParam(value), setAssetId(algoId), setAmount(0)])
          }
          onlyOwnAccounts
          value={fromParam}
        />
        {fromParam === "" && (
          <div style={{ color: "red" }}>Missing sender address.</div>
        )}
        {fromParam !== "" && !isValidSender && (
          <div style={{ color: "red" }}>Invalid sender address.</div>
        )}
        {senderError !== null && (
          <div style={{ color: "red" }}>{senderError.message}</div>
        )}
        {sender !== null && !isSenderFunded && (
          <div style={{ color: "red" }}>This account is not funded.</div>
        )}
      </InputGroup>
      <InputGroup group="to">
        <GroupLabel group="to">Recipient</GroupLabel>
        <AccountSelect
          accounts={contacts}
          allowManual
          label="Recipient"
          name="to"
          onChange={setToParam}
          value={toParam}
        />
        {toParam === "" && (
          <div style={{ color: "red" }}>Missing recipient address.</div>
        )}
        {toParam !== "" && !isValidReceiver && (
          <div style={{ color: "red" }}>Invalid recipient address.</div>
        )}
        {receiverError !== null && (
          <div style={{ color: "red" }}>{receiverError.message}</div>
        )}
        {senderAddress !== null && senderAddress === receiverAddress && (
          <div style={{ color: "orange" }}>
            The recipient address is equal to the sender.
          </div>
        )}
      </InputGroup>
      <InputGroup group="asset">
        <GroupLabel group="asset">Asset</GroupLabel>
        <InputLabel name="asset">Asset</InputLabel>
        <AssetSelect
          assets={senderAssetIds.map(senderAssetId => ({
            assetId: senderAssetId,
            name: prices?.[senderAssetId]?.name,
          }))}
          disabled={sender === null || !isSenderFunded}
          name="asset"
          onChange={value => Promise.all([setAssetId(value), setAmount(0)])}
          value={assetId}
        />
        {assetError !== null && (
          <div style={{ color: "red" }}>{assetError.message}</div>
        )}
        {receiver !== null && !isReceiverOptedInAsset && (
          <div style={{ color: "red" }}>
            Recipient has not opted in this asset.
          </div>
        )}
      </InputGroup>
      <InputGroup group="amount">
        <GroupLabel group="amount">Amount</GroupLabel>
        <div>
          <InputLabel name="amount">Amount</InputLabel>
          <AmountSelect
            decimals={assetDecimals}
            disabled={sender === null || !isSenderFunded}
            min={minAmount}
            max={maxAmount}
            name="amount"
            onChange={setAmount}
            unit={assetUnitName}
            value={amount}
          />
        </div>
        {receiver !== null && amount < minAmount && (
          <div style={{ color: "red" }}>
            The recipient address does not currently hold any{" "}
            {config.native_asset.params.name}. You must transfer at least{" "}
            <AssetDisplay amount={minAmount} assetId={algoId} /> to cover the
            minimum balance.
          </div>
        )}
        {sender !== null && !isAbleToPayFee && (
          <div style={{ color: "red" }}>Not enough funds to pay fee.</div>
        )}
        {sender !== null && !isSufficientFunds && (
          <div style={{ color: "red" }}>Not enough funds to transfer.</div>
        )}
        {sender !== null && isAbleToClose && isClosing && (
          <div style={{ color: "orange" }}>
            This transaction will close your account.
          </div>
        )}
        {amount === 0 && (
          <div style={{ color: "orange" }}>
            This transaction will not transfer any assets.
          </div>
        )}
        {asset !== null && (
          <div>
            <InputLabel name="balance">Balance</InputLabel>
            <InputBase
              disabled
              name="balance"
              value={`${printDecimals(assetBalance, asset.params.decimals)} ${
                asset.params.unitName
              }`}
            />
          </div>
        )}
        {asset !== null && (
          <div>
            <InputLabel name="available">Available</InputLabel>
            <InputBase
              disabled
              name="available"
              value={`${printDecimals(maxAmount, asset.params.decimals)} ${
                asset.params.unitName
              }`}
            />
          </div>
        )}
        {assetId === algoId && (
          <div>
            <InputLabel name="locked">Locked</InputLabel>
            <InputBase
              disabled
              name="locked"
              value={`${printDecimals(senderMinBalance, algoDecimals)} ${
                config.native_asset.params.unitName
              }`}
            />
          </div>
        )}
        {asset !== null && (
          <div>
            <InputLabel name="remaining">Remaining</InputLabel>
            <InputBase
              disabled
              name="remaining"
              value={`${printDecimals(
                assetId === algoId
                  ? assetBalance - amount - minFee
                  : assetBalance - amount,
                asset.params.decimals
              )} ${asset.params.unitName}`}
            />
          </div>
        )}
      </InputGroup>
      <InputGroup group="fees">
        <GroupLabel group="fees">Fees</GroupLabel>
        <div>
          <InputLabel name="algo-balance">Balance</InputLabel>
          <InputBase
            disabled
            name="algo-balance"
            value={`${printDecimals(senderBalance, algoDecimals)} ${
              config.native_asset.params.unitName
            }`}
          />
        </div>
        <div>
          <InputLabel name="algo-fee">Transaction fee</InputLabel>
          <InputBase
            disabled
            name="algo-fee"
            value={`${printDecimals(minFee, algoDecimals)} ${
              config.native_asset.params.unitName
            }`}
          />
        </div>
        <div>
          <InputLabel name="algo-remaining">Remaining</InputLabel>
          <InputBase
            disabled
            name="algo-remaining"
            value={`${printDecimals(
              assetId === algoId
                ? senderBalance - amount - minFee
                : senderBalance - minFee,
              algoDecimals
            )} ${config.native_asset.params.unitName}`}
          />
        </div>
      </InputGroup>
      <InputGroup group="advanced">
        <GroupLabel group="advanced">Advanced</GroupLabel>
        <div>
          <InputLabel name="note">Note</InputLabel>
        </div>
        <div>
          <InputTextArea
            name="note"
            onChange={setNote}
            placeholder="Note (optional)"
            value={note}
          />
        </div>
      </InputGroup>
      <FormSubmit disabled={!isAbleToSubmit || isSubmitting} label="Confirm" />
    </Form>
  )
}
