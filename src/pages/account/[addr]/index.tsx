import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"

import { ALGO_ASSET_DECIMALS } from "components/NativeAsset"
import ViewAccount from "components/ViewAccount"
import { AlgoAPI } from "lib/algo/AlgoAPI"
import {
  changePIN,
  getAddress,
  withSecretKey,
  removeAccount,
} from "lib/utils/auth"

export default function ViewAccountPage() {
  const router = useRouter()

  const { isReady, query } = router

  const address = Array.isArray(query.addr) ? query.addr[0] : query.addr

  useEffect(() => {
    if (isReady && !address) {
      router.replace("/").catch(error => {
        console.error(error)
      })
    }
  }, [address, isReady, router])

  const onShowPassphrase = useCallback(() => {
    withSecretKey(key => {
      // eslint-disable-next-line no-alert
      window.alert(algosdk.secretKeyToMnemonic(key))
    })
  }, [])

  const onRemoveAccount = useCallback(() => {
    if (removeAccount()) {
      router.replace("/").catch(error => {
        console.error(error)
      })
    }
  }, [router])

  const onSend = useCallback(async () => {
    if (!address) {
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

    const suggestedParams = await AlgoAPI.getTransactionParams().do()

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      amount: Math.ceil(amount * 10 ** ALGO_ASSET_DECIMALS),
      from: address,
      note: note ? new TextEncoder().encode(note) : undefined,
      suggestedParams,
      to,
    })

    let signed: Uint8Array | undefined

    withSecretKey(key => {
      signed = transaction.signTxn(key)
    })

    if (!signed) {
      return
    }

    await AlgoAPI.sendRawTransaction(signed).do()

    // eslint-disable-next-line no-alert
    window.alert(
      `Sending ${Math.ceil(
        amount * 10 ** ALGO_ASSET_DECIMALS
      )} Algos to ${to}...\nTransaction ID: ${transaction.txID()}`
    )
  }, [address])

  const onSendAsset = useCallback(async () => {
    if (!address) {
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

    const suggestedParams = await AlgoAPI.getTransactionParams().do()

    const transaction =
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount,
        assetIndex: Number(assetId),
        from: address,
        note: note ? new TextEncoder().encode(note) : undefined,
        suggestedParams,
        to,
      })

    let signed: Uint8Array | undefined

    withSecretKey(key => {
      signed = transaction.signTxn(key)
    })

    if (!signed) {
      return
    }

    await AlgoAPI.sendRawTransaction(signed).do()

    // eslint-disable-next-line no-alert
    window.alert(
      `Sending ${amount} of asset ${assetId} to ${to}...\nTransaction ID: ${transaction.txID()}`
    )
  }, [address])

  const addApplication = useCallback(async () => {
    if (!address) {
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

    const suggestedParams = await AlgoAPI.getTransactionParams().do()

    const transaction = algosdk.makeApplicationOptInTxnFromObject({
      appIndex: Number(appId),
      from: address,
      suggestedParams,
    })

    let signed: Uint8Array | undefined

    withSecretKey(key => {
      signed = transaction.signTxn(key)
    })

    if (!signed) {
      return
    }

    await AlgoAPI.sendRawTransaction(signed).do()

    // eslint-disable-next-line no-alert
    window.alert(
      `Adding application ${appId}...\nTransaction ID: ${transaction.txID()}`
    )
  }, [address])

  const removeApplication = useCallback(async () => {
    if (!address) {
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

    const suggestedParams = await AlgoAPI.getTransactionParams().do()

    const transaction = algosdk.makeApplicationCloseOutTxnFromObject({
      appIndex: Number(appId),
      from: address,
      suggestedParams,
    })

    let signed: Uint8Array | undefined

    withSecretKey(key => {
      signed = transaction.signTxn(key)
    })

    if (!signed) {
      return
    }

    await AlgoAPI.sendRawTransaction(signed).do()

    // eslint-disable-next-line no-alert
    window.alert(
      `Removing application ${appId}...\nTransaction ID: ${transaction.txID()}`
    )
  }, [address])

  const addAsset = useCallback(async () => {
    if (!address) {
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

    const suggestedParams = await AlgoAPI.getTransactionParams().do()

    const transaction =
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount: 0,
        assetIndex: Number(assetId),
        from: address,
        suggestedParams,
        to: address,
      })

    let signed: Uint8Array | undefined

    withSecretKey(key => {
      signed = transaction.signTxn(key)
    })

    if (!signed) {
      return
    }

    await AlgoAPI.sendRawTransaction(signed).do()

    // eslint-disable-next-line no-alert
    window.alert(
      `Adding asset ${assetId}...\nTransaction ID: ${transaction.txID()}`
    )
  }, [address])

  if (!address) {
    return <pre>Loading...</pre>
  }

  return (
    <div>
      <Link href="/">Back</Link>
      <ViewAccount address={address} />
      {address === getAddress() && (
        <button onClick={changePIN}>Change PIN</button>
      )}
      {address === getAddress() && (
        <button onClick={onShowPassphrase}>Show passphrase</button>
      )}
      {address === getAddress() && (
        <button onClick={onRemoveAccount}>Remove account</button>
      )}
      {address === getAddress() && (
        <button onClick={addApplication}>Add application</button>
      )}
      {address === getAddress() && (
        <button onClick={removeApplication}>Remove application</button>
      )}
      {address === getAddress() && (
        <button onClick={addAsset}>Add asset</button>
      )}
      {address === getAddress() && <button onClick={onSend}>Send Algos</button>}
      {address === getAddress() && (
        <button onClick={onSendAsset}>Send asset</button>
      )}
    </div>
  )
}
