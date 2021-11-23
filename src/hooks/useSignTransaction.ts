import algosdk from "algosdk"
import { useNetworkContext } from "context/NetworkContext"
import { usePinModal } from "context/PinModalContext"
import { PendingTransaction } from "lib/algo/Transaction"
import { toError } from "lib/utils/error"
import { useCallback } from "react"
import { mutate } from "swr"

export interface SignTransactionOptions {
  onConfirmed: (transaction: PendingTransaction) => void
  onRejected: (error: Error) => void
}

export interface UseSignTransactionResult {
  signTransaction(
    transaction: algosdk.Transaction,
    options: SignTransactionOptions
  ): Promise<string>
}

export function useSignTransaction(): UseSignTransactionResult {
  const { api, network } = useNetworkContext()
  const { getPrivateKey } = usePinModal()

  const waitForConfirmation = useCallback(
    async (txId: string) => {
      const status = await api.status().do()
      const startRound = status["last-round"] + 1
      const endRound = startRound + 1000

      for (let round = startRound; round < endRound; round++) {
        await api.statusAfterBlock(round).do()

        const txn = await api.pendingTransactionInformation(txId).do()

        if (txn["confirmed-round"]) {
          if (txn["confirmed-round"] > round) {
            await api.statusAfterBlock(txn["confirmed-round"]).do()
          }

          // Refetch account balances
          const sender = algosdk.encodeAddress(txn.txn.txn.snd)
          mutate(`${network}:accounts/${sender}`)
          const receiver = algosdk.encodeAddress(txn.txn.txn.rcv)
          mutate(`${network}:accounts/${receiver}`)

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
    async (
      transaction: algosdk.Transaction,
      options: SignTransactionOptions
    ) => {
      const address = algosdk.encodeAddress(transaction.from.publicKey)
      const key = await getPrivateKey(address)
      const signed = transaction.signTxn(key)

      const { txId } = await api.sendRawTransaction(signed).do()

      waitForConfirmation(txId).then(
        confirmed => options.onConfirmed(confirmed),
        error => options.onRejected(toError(error))
      )

      return txId
    },
    [api, getPrivateKey, network, waitForConfirmation]
  )

  return {
    signTransaction,
  }
}
