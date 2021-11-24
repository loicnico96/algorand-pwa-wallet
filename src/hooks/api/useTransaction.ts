import algosdk from "algosdk"
import { useNetworkContext } from "context/NetworkContext"
import { useSecurityContext } from "context/SecurityContext"
import { PendingTransaction } from "lib/algo/Transaction"
import { useCallback } from "react"
import { mutate } from "swr"

export interface UseTransactionResult {
  signTransaction(transaction: algosdk.Transaction): Promise<string>
  waitForConfirmation(transactionId: string): Promise<PendingTransaction>
}

export function useTransaction(): UseTransactionResult {
  const { api, network } = useNetworkContext()
  const { getPrivateKey } = useSecurityContext()

  const waitForConfirmation = useCallback(
    async (transactionId: string) => {
      const status = await api.status().do()
      const startRound = status["last-round"] + 1
      const endRound = startRound + 1000

      for (let round = startRound; round < endRound; round++) {
        await api.statusAfterBlock(round).do()

        const txn = await api.pendingTransactionInformation(transactionId).do()

        if (txn["confirmed-round"]) {
          if (txn["confirmed-round"] > round) {
            await api.statusAfterBlock(txn["confirmed-round"]).do()
          }

          // Refetch account balances
          const sender = algosdk.encodeAddress(txn.txn.txn.snd)
          mutate(`${network}:api/accounts/${sender}`)
          const receiver = algosdk.encodeAddress(txn.txn.txn.rcv)
          mutate(`${network}:api/accounts/${receiver}`)

          return txn as PendingTransaction
        }

        if (txn["pool-error"]) {
          throw Error(txn["pool-error"])
        }
      }

      throw Error("Transaction not confirmed.")
    },
    [api]
  )

  const signTransaction = useCallback(
    async (transaction: algosdk.Transaction) => {
      const address = algosdk.encodeAddress(transaction.from.publicKey)
      const key = await getPrivateKey(address)
      const signed = transaction.signTxn(key)
      const sent = await api.sendRawTransaction(signed).do()
      return sent.txId
    },
    [api, getPrivateKey]
  )

  return {
    signTransaction,
    waitForConfirmation,
  }
}
