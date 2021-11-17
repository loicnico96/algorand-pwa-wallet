import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"

import { ALGO_ASSET_DECIMALS } from "components/NativeAsset"
import ViewAccount from "components/ViewAccount"
import { useAccountData, useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { decryptKey, encryptKey, promptPIN } from "lib/utils/auth"
import { Route } from "lib/utils/navigation"

export default function ViewAccountPage() {
  const router = useRouter()

  const { api } = useNetworkContext()
  const { isReady, query } = router

  const address = Array.isArray(query.address)
    ? query.address[0]
    : query.address

  const accountData = useAccountData(address ?? null)

  const { removeAccount, updateAccount } = useAddressBook()

  useEffect(() => {
    if (isReady && !address) {
      router.replace(Route.ACCOUNT_LIST).catch(error => {
        console.error(error)
      })
    }
  }, [address, isReady, router])

  const onChangePin = useCallback(async () => {
    if (accountData?.key) {
      const oldPin = promptPIN("Enter your current PIN:")
      if (oldPin) {
        const newPin = promptPIN("Choose your new PIN:")
        if (newPin) {
          const key = decryptKey(accountData.key, oldPin)
          await updateAccount(accountData.address, {
            key: encryptKey(key, newPin),
          })
        }
      }
    }
  }, [accountData, updateAccount])

  const onShowPassphrase = useCallback(() => {
    if (accountData?.key) {
      const pin = promptPIN("Enter your PIN:")
      if (pin) {
        const key = decryptKey(accountData.key, pin)
        // eslint-disable-next-line no-alert
        window.alert(algosdk.secretKeyToMnemonic(key))
      }
    }
  }, [accountData])

  const onRemoveAccount = useCallback(async () => {
    if (accountData) {
      await removeAccount(accountData.address)
      await router.replace(Route.ACCOUNT_LIST)
    }
  }, [accountData, removeAccount, router])

  const onSend = useCallback(async () => {
    if (!address || !accountData?.key) {
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

    const suggestedParams = await api.getTransactionParams().do()

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      amount: Math.ceil(amount * 10 ** ALGO_ASSET_DECIMALS),
      from: address,
      note: note ? new TextEncoder().encode(note) : undefined,
      suggestedParams,
      to,
    })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(accountData.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Sending ${Math.ceil(
          amount * 10 ** ALGO_ASSET_DECIMALS
        )} Algos to ${to}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [accountData, address, api])

  const onSendAsset = useCallback(async () => {
    if (!address || !accountData?.key) {
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

    const suggestedParams = await api.getTransactionParams().do()

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
      const key = decryptKey(accountData.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Sending ${amount} of asset ${assetId} to ${to}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [accountData, address, api])

  const addApplication = useCallback(async () => {
    if (!address || !accountData?.key) {
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

    const suggestedParams = await api.getTransactionParams().do()

    const transaction = algosdk.makeApplicationOptInTxnFromObject({
      appIndex: Number(appId),
      from: address,
      suggestedParams,
    })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(accountData.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Adding application ${appId}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [accountData, address, api])

  const removeApplication = useCallback(async () => {
    if (!address || !accountData?.key) {
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

    const suggestedParams = await api.getTransactionParams().do()

    const transaction = algosdk.makeApplicationCloseOutTxnFromObject({
      appIndex: Number(appId),
      from: address,
      suggestedParams,
    })

    const pin = promptPIN("Enter your PIN:")
    if (pin) {
      const key = decryptKey(accountData.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Removing application ${appId}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [accountData, address, api])

  const addAsset = useCallback(async () => {
    if (!address || !accountData?.key) {
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

    const suggestedParams = await api.getTransactionParams().do()

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
      const key = decryptKey(accountData.key, pin)
      const signed = transaction.signTxn(key)

      await api.sendRawTransaction(signed).do()

      // eslint-disable-next-line no-alert
      window.alert(
        `Adding asset ${assetId}...\nTransaction ID: ${transaction.txID()}`
      )
    }
  }, [accountData, address, api])

  if (!address) {
    return <pre>Loading...</pre>
  }

  return (
    <div>
      <Link href={Route.ACCOUNT_LIST}>Back</Link>
      <ViewAccount address={address} />
      {Boolean(accountData?.key) && (
        <div>
          <button onClick={onChangePin}>Change PIN</button>
          <button onClick={onShowPassphrase}>Show passphrase</button>
          <button onClick={onRemoveAccount}>Remove account</button>
          <button onClick={addApplication}>Add application</button>
          <button onClick={removeApplication}>Remove application</button>
          <button onClick={addAsset}>Add asset</button>
          <button onClick={onSend}>Send Algos</button>
          <button onClick={onSendAsset}>Send asset</button>
        </div>
      )}
    </div>
  )
}
