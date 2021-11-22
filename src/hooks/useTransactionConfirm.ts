import algosdk from "algosdk"
import { useAccountData } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { Address } from "lib/algo/Account"
import { decryptKey, promptPIN } from "lib/utils/auth"
import { useCallback } from "react"

export interface UseTransactionConfirmResult {
  isAbleToSign: boolean
  signTransaction: (transaction: algosdk.Transaction) => Promise<string | null>
}

export function useTransactionConfirm(
  address: Address | null
): UseTransactionConfirmResult {
  const { api, network } = useNetworkContext()

  const encryptedKey = useAccountData(address)?.key

  const signTransaction = useCallback(
    async (transaction: algosdk.Transaction) => {
      if (!encryptedKey) {
        return null
      }

      const pin = promptPIN("Enter your PIN:")
      if (pin === null) {
        return null
      }

      const signed = transaction.signTxn(decryptKey(encryptedKey, pin))

      const { txId } = await api.sendRawTransaction(signed).do()

      return txId
    },
    [api, network]
  )

  return {
    isAbleToSign: Boolean(encryptedKey),
    signTransaction,
  }
}
