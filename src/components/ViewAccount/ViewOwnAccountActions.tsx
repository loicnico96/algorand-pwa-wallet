import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { useTransactionParams } from "hooks/useTransactionParams"
import { AccountInfo } from "lib/algo/Account"
import { AccountData } from "lib/db/schema"
import { decryptKey, encryptKey, promptPIN } from "lib/utils/auth"
import { Route, RouteParam, withSearchParams } from "lib/utils/navigation"

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
  const { api } = useNetworkContext()

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

  const sendUrl = withSearchParams(Route.SEND, {
    [RouteParam.ADDRESS_FROM]: address,
  })

  return (
    <div>
      <AsyncButton onClick={onChangePin} label="Change PIN" />
      <AsyncButton onClick={onShowPassphrase} label="Show passphrase" />
      <AsyncButton onClick={onRemoveAccount} label="Remove account" />
      <AsyncButton onClick={addApplication} label="Add application" />
      <AsyncButton onClick={removeApplication} label="Remove application" />
      <AsyncButton onClick={addAsset} label="Add asset" />
      <Link href={sendUrl}>
        <a>
          <button>Send</button>
        </a>
      </Link>
    </div>
  )
}
