import algosdk from "algosdk"
import { useCallback } from "react"
import { toast } from "react-toastify"

import { AsyncButton } from "components/AsyncButton"
import { useNetworkContext } from "context/NetworkContext"
import { useAccountAssetIds } from "hooks/api/useAccountAssetIds"
import { useAccountBalance } from "hooks/api/useAccountBalance"
import { useAccountInfo } from "hooks/api/useAccountInfo"
import { useAccountMinBalance } from "hooks/api/useAccountMinBalance"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useTransaction } from "hooks/api/useTransaction"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { useIntParamState } from "hooks/navigation/useIntParamState"
import { useParamState } from "hooks/navigation/useParamState"
import { useContacts } from "hooks/storage/useContacts"
import { createTransferTransaction } from "lib/algo/transactions/Transfer"
import { createLogger } from "lib/utils/logger"
import { RouteParam } from "lib/utils/navigation"

import { AccountSelect } from "./AccountSelect"
import { AmountSelect } from "./AmountSelect"
import { AssetDisplay } from "./AssetDisplay"
import { AssetSelect } from "./AssetSelect"

export function SendForm() {
  const { data: contacts } = useContacts()
  const { config } = useNetworkContext()
  const { refetch: refetchParams } = useTransactionParams()
  const { signTransaction, waitForConfirmation } = useTransaction()

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
  const assetUnitName = asset?.params["unit-name"]

  const onSubmit = useCallback(async () => {
    if (sender !== null && receiver !== null && asset !== null) {
      const params = await refetchParams()

      const transaction = createTransferTransaction(config, {
        amount,
        assetId,
        close: isClosing,
        note,
        params,
        receiver: receiver.address,
        sender: sender.address,
      })

      const logger = createLogger("Transaction")

      try {
        logger.log("Sign", transaction)
        const transactionId = await signTransaction(transaction)
        logger.log(`Sent ${transactionId}`, transaction)
        toast.info("Transaction sent.")

        waitForConfirmation(transactionId).then(
          confirmed => {
            logger.log(`Confirmed ${transactionId}`, confirmed)
            toast.success("Transaction confirmed.")
          },
          error => {
            logger.error(error)
            toast.error("Transaction rejected.")
          }
        )
      } catch (error) {
        logger.error(error)
        toast.warn("Transaction aborted.")
      }
    }
  }, [
    config,
    signTransaction,
    refetchParams,
    waitForConfirmation,
    isClosing,
    sender,
    receiver,
    asset,
    amount,
    assetId,
    note,
  ])

  return (
    <div>
      <div>
        <p>From:</p>
        <AccountSelect
          accounts={contacts}
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
      </div>
      <div>
        <p>To:</p>
        <AccountSelect
          accounts={contacts}
          allowManual
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
      </div>
      <div>
        <p>Asset:</p>
        <AssetSelect
          assetIds={senderAssetIds}
          disabled={sender === null || !isSenderFunded}
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
      </div>
      <div>
        <p>Amount:</p>
        <div>
          Available: <AssetDisplay amount={maxAmount} assetId={assetId} />
        </div>
        {assetId === algoId && (
          <div>
            Locked: <AssetDisplay amount={senderMinBalance} assetId={algoId} />
          </div>
        )}
        <AmountSelect
          decimals={assetDecimals}
          disabled={sender === null || !isSenderFunded}
          min={minAmount}
          max={maxAmount}
          onChange={setAmount}
          unit={assetUnitName}
          value={amount}
        />
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
      </div>
      <div>
        <p>Fee:</p>
        <div>
          Balance: <AssetDisplay amount={senderBalance} assetId={algoId} />
        </div>
        <div>
          Fee: <AssetDisplay amount={minFee} assetId={algoId} />
        </div>
      </div>
      <div>
        <p>Note:</p>
        <input
          onChange={e => setNote(e.target.value)}
          placeholder="Note (optional)"
          type="text"
          value={note}
        />
      </div>
      <AsyncButton
        disabled={!isAbleToSubmit}
        label="Confirm"
        onClick={onSubmit}
      />
    </div>
  )
}
