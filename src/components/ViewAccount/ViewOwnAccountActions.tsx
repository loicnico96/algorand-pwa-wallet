import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useCallback } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { useTransactionParams } from "hooks/useTransactionParams"
import { AccountInfo } from "lib/algo/Account"
import { AccountData } from "lib/db/schema"
import { decryptKey, encryptKey, promptPIN } from "lib/utils/auth"
import { Route } from "lib/utils/navigation"

export interface ViewOwnAccountActionsProps {
  account: AccountInfo
  data: AccountData
}

export function ViewOwnAccountActions({
  account,
  data,
}: ViewOwnAccountActionsProps) {
  const router = useRouter()

  const { address } = account
  const { api, config } = useNetworkContext()

  const { removeAccount, updateAccount } = useAddressBook()

  const { refetch: refetchParams } = useTransactionParams()

  const onChangePin = useCallback(async () => {
    if (data?.key) {
      const oldPin = promptPIN("Enter your current PIN:")
      if (oldPin) {
        const newPin = promptPIN("Choose your new PIN:")
        if (newPin) {
          const key = decryptKey(data.key, oldPin)
          await updateAccount(address, {
            key: encryptKey(key, newPin),
          })
        }
      }
    }
  }, [address, data, updateAccount])

  const onShowPassphrase = useCallback(() => {
    if (data?.key) {
      const pin = promptPIN("Enter your PIN:")
      if (pin) {
        const key = decryptKey(data.key, pin)
        // eslint-disable-next-line no-alert
        window.alert(algosdk.secretKeyToMnemonic(key))
      }
    }
  }, [data])

  const onRemoveAccount = useCallback(async () => {
    if (data) {
      await removeAccount(address)
      await router.replace(Route.ACCOUNTS_LIST)
    }
  }, [address, data, removeAccount, router])

  const onSend = useCallback(async () => {
    if (!data?.key) {
      return
    }

    // eslint-disable-next-line no-alert
    const to = window.prompt("Receiver address:")
    if (to === null) {
      return
    }

    if (!algosdk.isValidAddress(to)) {
      throw Error("Invalid address")
    }

    // eslint-disable-next-line no-alert
    const amountStr = window.prompt("Amount (Algos):")
    if (amountStr === null) {
      return
    }

    const amount = Number(amountStr)

    if (!Number.isFinite(amount)) {
      throw Error("Invalid address")
    }

    // eslint-disable-next-line no-alert
    const note = window.prompt("Note (optional):")

    const suggestedParams = await refetchParams()

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      amount: Math.ceil(amount * 10 ** config.native_asset.params.decimals),
      from: address,
      note: note ? new TextEncoder().encode(note) : undefined,
      suggestedParams,
      to,
    })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(data.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Sending ${Math.ceil(
          amount * 10 ** config.native_asset.params.decimals
        )} Algos to ${to}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [data, address, api, config, refetchParams])

  const onSendAsset = useCallback(async () => {
    if (!data?.key) {
      return
    }

    // eslint-disable-next-line no-alert
    const assetId = window.prompt("Asset ID:")
    if (assetId === null) {
      return
    }

    if (!Number.isInteger(Number(assetId)) || Number(assetId) < 0) {
      throw Error("Invalid asset ID")
    }

    // eslint-disable-next-line no-alert
    const to = window.prompt("Receiver address:")
    if (to === null) {
      return
    }

    if (!algosdk.isValidAddress(to)) {
      throw Error("Invalid address")
    }

    // eslint-disable-next-line no-alert
    const amountStr = window.prompt("Amount:")
    if (amountStr === null) {
      return
    }

    const amount = Number(amountStr)

    if (!Number.isFinite(amount)) {
      throw Error("Invalid address")
    }

    // eslint-disable-next-line no-alert
    const note = window.prompt("Note (optional):")

    const suggestedParams = await refetchParams()

    const transaction =
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount,
        assetIndex: Number(assetId),
        from: address,
        note: note ? new TextEncoder().encode(note) : undefined,
        suggestedParams,
        to,
      })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(data.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Sending ${amount} of asset ${assetId} to ${to}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [data, address, api, refetchParams])

  const addApplication = useCallback(async () => {
    if (!data?.key) {
      return
    }

    // eslint-disable-next-line no-alert
    const appId = window.prompt("Application ID:")
    if (appId === null) {
      return
    }

    if (!Number.isInteger(Number(appId)) || Number(appId) < 0) {
      throw Error("Invalid application ID")
    }

    const suggestedParams = await refetchParams()

    const transaction = algosdk.makeApplicationOptInTxnFromObject({
      appIndex: Number(appId),
      from: address,
      suggestedParams,
    })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(data.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Adding application ${appId}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [data, address, api, refetchParams])

  const removeApplication = useCallback(async () => {
    if (!data?.key) {
      return
    }

    // eslint-disable-next-line no-alert
    const appId = window.prompt("Application ID:")
    if (appId === null) {
      return
    }

    if (!Number.isInteger(Number(appId)) || Number(appId) < 0) {
      throw Error("Invalid application ID")
    }

    const suggestedParams = await refetchParams()

    const transaction = algosdk.makeApplicationCloseOutTxnFromObject({
      appIndex: Number(appId),
      from: address,
      suggestedParams,
    })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(data.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Removing application ${appId}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [data, address, api, refetchParams])

  const addAsset = useCallback(async () => {
    if (!data?.key) {
      return
    }

    // eslint-disable-next-line no-alert
    const assetId = window.prompt("Asset ID:")
    if (assetId === null) {
      return
    }

    if (!Number.isInteger(Number(assetId)) || Number(assetId) < 0) {
      throw Error("Invalid asset ID")
    }

    const suggestedParams = await refetchParams()

    const transaction =
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount: 0,
        assetIndex: Number(assetId),
        from: address,
        suggestedParams,
        to: address,
      })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(data.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Adding asset ${assetId}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [data, address, api, refetchParams])

  return (
    <div>
      <AsyncButton onClick={onChangePin} label="Change PIN" />
      <AsyncButton onClick={onShowPassphrase} label="Show passphrase" />
      <AsyncButton onClick={onRemoveAccount} label="Remove account" />
      <AsyncButton onClick={addApplication} label="Add application" />
      <AsyncButton onClick={removeApplication} label="Remove application" />
      <AsyncButton onClick={addAsset} label="Add asset" />
      <AsyncButton onClick={onSend} label="Send Algos" />
      <AsyncButton onClick={onSendAsset} label="Send asset" />
    </div>
  )
}
