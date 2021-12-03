import algosdk, { Transaction } from "algosdk"
import { useNetworkContext } from "context/NetworkContext"
import { useSecurityContext } from "context/SecurityContext"
import { EncodedTransaction, PendingTransaction } from "lib/algo/api"
import { getIndexerQuery } from "lib/algo/api/query"
import {
  getTransactionSigner,
  signTransaction,
  TransactionGroup,
} from "lib/algo/transactions"
import { toError } from "lib/utils/error"
import { createLogger } from "lib/utils/logger"
import { isArray } from "lib/utils/types"
import { useCallback } from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"

export interface SendTransactionParams {
  onAborted?: (error: Error) => void
  onConfirmed?: (transaction: EncodedTransaction) => void
  onRejected?: (error: Error) => void
  onSent?: (transactionId: string) => void
}

export interface UseTransactionResult {
  sendTransaction: (
    transaction: Transaction | TransactionGroup,
    params?: SendTransactionParams
  ) => Promise<void>
}

const TXN_ADDRESS_FIELDS = ["arcv", "asnd", "rcv", "snd"] as const

export function useTransaction(): UseTransactionResult {
  const { api, network } = useNetworkContext()
  const { getPrivateKey } = useSecurityContext()

  const waitForConfirmation = useCallback(
    async (transactionId: string): Promise<EncodedTransaction> => {
      const status = await getIndexerQuery(api.status())
      const startRound = status.lastRound + 1
      const endRound = startRound + 1000

      for (let round = startRound; round < endRound; round++) {
        await getIndexerQuery(api.statusAfterBlock(round))

        const query = api.pendingTransactionInformation(transactionId)
        const txn = (await getIndexerQuery(query)) as PendingTransaction

        if (txn.confirmedRound) {
          if (txn.confirmedRound > round) {
            await getIndexerQuery(api.statusAfterBlock(txn.confirmedRound))
          }

          // Refetch account balances
          for (const addressField of TXN_ADDRESS_FIELDS) {
            const address = txn.txn.txn[addressField]
            if (address) {
              const encodedAddress = algosdk.encodeAddress(address)
              mutate(`${network}:api/accounts/${encodedAddress}`)
            }
          }

          return txn.txn.txn
        }

        if (txn.poolError) {
          throw Error(txn.poolError)
        }

        if (round >= txn.txn.txn.lv) {
          throw Error("Transaction expired.")
        }
      }

      throw Error("Transaction expired.")
    },
    [api]
  )

  const sendTransaction = useCallback(
    async (
      transaction: Transaction | TransactionGroup,
      {
        onAborted = () => toast.warn("Transaction aborted."),
        onConfirmed = () => toast.success("Transaction confirmed."),
        onRejected = () => toast.error("Transaction rejected."),
        onSent = () => toast.info("Transaction sent."),
      }: SendTransactionParams = {}
    ): Promise<void> => {
      const logger = createLogger("Transaction")

      try {
        const keys: Record<string, Uint8Array> = {}
        const unsigned = isArray(transaction) ? transaction : [transaction]
        const signed: Uint8Array[] = []

        logger.log("Signing...", unsigned)

        for (const txn of unsigned) {
          if (txn instanceof Transaction) {
            const signer = getTransactionSigner(txn)

            let key = keys[signer]

            if (!key) {
              logger.log("Signing with account...", signer)
              key = await getPrivateKey(signer)
              keys[signer] = key
            }

            signed.push(signTransaction(txn, key))
          } else {
            signed.push(txn)
          }
        }

        logger.log("Sending...", signed)
        const sent = await getIndexerQuery(api.sendRawTransaction(signed))
        const transactionId = sent.txId as string

        logger.log("Sent", transactionId)
        onSent(transactionId)

        waitForConfirmation(transactionId).then(
          transaction => {
            logger.log("Confirmed", transaction)
            onConfirmed(transaction)
          },
          error => {
            logger.error(error)
            onRejected(toError(error))
          }
        )
      } catch (error) {
        logger.error(error)
        onAborted(toError(error))
        throw error
      }
    },
    [api, getPrivateKey]
  )

  return { sendTransaction }
}
