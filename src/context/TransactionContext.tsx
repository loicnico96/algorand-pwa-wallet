import algosdk from "algosdk"
import { useQuery } from "hooks/useQuery"
import { PendingTransaction } from "lib/algo/Transaction"
import { getAccount } from "lib/db/schema"
import { decryptKey, promptPIN } from "lib/utils/auth"
import { useCallback, useContext, useState } from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"
import { useNetworkContext } from "./NetworkContext"
import { createEmptyContext, ProviderProps } from "./utils"

export interface TransactionContextValue {
  pendingTransaction: PendingTransaction | null
  pendingTransactionId: string | null
  signTransaction(transaction: algosdk.Transaction): Promise<string | null>
}

export const TransactionContext = createEmptyContext<TransactionContextValue>()

export function TransactionContextProvider({ children }: ProviderProps) {
  const { api, network } = useNetworkContext()

  const [pendingTransactionId, setPendingTransactionId] = useState<
    string | null
  >(null)

  const { data } = useQuery(
    pendingTransactionId
      ? `${network}:transactions/${pendingTransactionId}`
      : null,
    pendingTransactionId
      ? async () => {
          const result = await api
            .pendingTransactionInformation(pendingTransactionId)
            .do()
          return result as PendingTransaction
        }
      : null,
    {
      onSuccess: async transaction => {
        if (transaction["confirmed-round"]) {
          toast.success("Transaction confirmed.")
          setPendingTransactionId(null)
          // Wait for block information to be available
          await api.statusAfterBlock(transaction["confirmed-round"]).do()
          const receiver = algosdk.encodeAddress(transaction.txn.txn.rcv)
          const sender = algosdk.encodeAddress(transaction.txn.txn.snd)
          // Refetch balances
          mutate(`${network}:accounts/${receiver}`)
          mutate(`${network}:accounts/${sender}`)
        } else if (transaction["pool-error"]) {
          toast.error(transaction["pool-error"])
          setPendingTransactionId(null)
        }
      },
      pollInterval: 3000,
    }
  )

  const signTransaction = useCallback(
    async (transaction: algosdk.Transaction) => {
      const address = algosdk.encodeAddress(transaction.from.publicKey)
      const accountData = await getAccount(network, address)

      if (!accountData?.key) {
        return null
      }

      const pin = promptPIN("Enter your PIN:")
      if (pin === null) {
        return null
      }

      const signed = transaction.signTxn(decryptKey(accountData.key, pin))

      const { txId } = await api.sendRawTransaction(signed).do()

      setPendingTransactionId(txId)

      return txId
    },
    [api, network]
  )

  const value: TransactionContextValue = {
    pendingTransaction: data,
    pendingTransactionId,
    signTransaction,
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactionContext(): TransactionContextValue {
  return useContext(TransactionContext)
}
