import algosdk from "algosdk"
import { PinModal } from "components/PinModal"
import { useQuery } from "hooks/useQuery"
import { PendingTransaction } from "lib/algo/Transaction"
import { getAccount } from "lib/db/schema"
import { decryptKey } from "lib/utils/auth"
import { useCallback, useContext, useState } from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"
import { useNetworkContext } from "./NetworkContext"
import { createEmptyContext, ProviderProps } from "./utils"

export interface TransactionToSign {
  onConfirm: (pin: string) => Promise<void>
  onClose: () => void
  transaction: algosdk.Transaction
}

export interface TransactionContextValue {
  pendingTransaction: PendingTransaction | null
  pendingTransactionId: string | null
  signTransaction(transaction: algosdk.Transaction): Promise<string>
}

export const TransactionContext = createEmptyContext<TransactionContextValue>()

export function TransactionContextProvider({ children }: ProviderProps) {
  const { api, network } = useNetworkContext()

  const [transactionToSign, setTransactionToSign] =
    useState<TransactionToSign | null>(null)

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
      const account = await getAccount(network, address)
      const encryptedKey = account?.key
      if (!encryptedKey) {
        throw Error("Cannot sign transactions with this account.")
      }

      return new Promise<string>((resolve, reject) => {
        setTransactionToSign({
          onClose: () => reject(Error("Transaction aborted.")),
          onConfirm: async pin => {
            const signed = transaction.signTxn(decryptKey(encryptedKey, pin))
            const { txId } = await api.sendRawTransaction(signed).do()
            setPendingTransactionId(txId)
            resolve(txId)
          },
          transaction,
        })
      })
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
      <PinModal
        isOpen={!!transactionToSign}
        onClose={() => {
          if (transactionToSign) {
            transactionToSign.onClose()
            setTransactionToSign(null)
          }
        }}
        onConfirm={async pin => {
          if (transactionToSign) {
            await transactionToSign.onConfirm(pin)
            setTransactionToSign(null)
          }
        }}
      />
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactionContext(): TransactionContextValue {
  return useContext(TransactionContext)
}
