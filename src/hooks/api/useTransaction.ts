import algosdk from "algosdk"
import { useNetworkContext } from "context/NetworkContext"
import { useSecurityContext } from "context/SecurityContext"
import { PendingTransaction } from "lib/algo/Transaction"
import { useCallback } from "react"
import { mutate } from "swr"

export interface UseTransactionResult {
  signTransaction(
    ...transactions: (algosdk.Transaction | Uint8Array)[]
  ): Promise<string>
  waitForConfirmation(transactionId: string): Promise<PendingTransaction>
}

const TXN_ADDRESS_FIELDS = ["arcv", "asnd", "rcv", "snd"] as const

export function useTransaction(): UseTransactionResult {
  const { api, network } = useNetworkContext()
  const { getPrivateKey } = useSecurityContext()

  const waitForConfirmation = useCallback(
    async (transactionId: string) => {
      const status = await api.status().do()
      const startRound = status["last-round"] + 1
      let endRound = startRound + 1000

      for (let round = startRound; round < endRound; round++) {
        await api.statusAfterBlock(round).do()

        const txn = (await api
          .pendingTransactionInformation(transactionId)
          .do()) as PendingTransaction

        if (txn["confirmed-round"]) {
          if (txn["confirmed-round"] > round) {
            await api.statusAfterBlock(txn["confirmed-round"]).do()
          }

          // Refetch account balances
          for (const addressField of TXN_ADDRESS_FIELDS) {
            const address = txn.txn.txn[addressField]
            if (address) {
              const encodedAddress = algosdk.encodeAddress(address)
              mutate(`${network}:api/accounts/${encodedAddress}`)
            }
          }

          return txn as PendingTransaction
        }

        if (txn["pool-error"]) {
          throw Error(txn["pool-error"])
        }

        if (round >= txn.txn.txn.lv) {
          break
        }
      }

      throw Error("Transaction expired.")
    },
    [api]
  )

  const signTransaction = useCallback(
    async (...transactions: (algosdk.Transaction | Uint8Array)[]) => {
      const signedTransactions: Uint8Array[] = []
      const keys: Record<string, Uint8Array> = {}

      for (const transaction of transactions) {
        if (transaction instanceof algosdk.Transaction) {
          const address = algosdk.encodeAddress(transaction.from.publicKey)

          let key = keys[address]
          if (!key) {
            key = await getPrivateKey(address)
            keys[address] = key
          }

          signedTransactions.push(transaction.signTxn(key))
        } else {
          signedTransactions.push(transaction)
        }
      }

      const sent = await api.sendRawTransaction(signedTransactions).do()

      return sent.txId
    },
    [api, getPrivateKey]
  )

  return {
    signTransaction,
    waitForConfirmation,
  }
}
