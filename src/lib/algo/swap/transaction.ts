import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

import { createApplicationCallTransaction } from "../transactions/ApplicationCall"
import { createTransferTransaction } from "../transactions/Transfer"

import { getPoolLogicSig } from "./logicsig"
import { PoolInfo } from "./pool"
import { SwapQuote } from "./quote"

export interface SwapTransactionParams {
  params: SuggestedParams
  pool: PoolInfo
  quote: SwapQuote
  sender: string
}

export function createSwapTransaction(
  config: NetworkConfig,
  { params, pool, quote, sender }: SwapTransactionParams
): (algosdk.Transaction | Uint8Array)[] {
  const logicSig = getPoolLogicSig(config, pool)
  const logicSigAddress = logicSig.address()

  if (logicSigAddress !== pool.address || !logicSig.verify()) {
    throw Error("Invalid transaction.")
  }

  const transactions = [
    // 1. Payment of fees from swapper to pool
    createTransferTransaction(config, {
      amount: config.params.MinTxnFee * 2,
      params,
      receiver: pool.address,
      sender,
    }),
    // 2. NoOp application call of Tinyman main validator
    createApplicationCallTransaction({
      applicationId: config.tinyman.validator_app_id,
      args: ["swap", quote.swapMode],
      foreignAccounts: [sender],
      foreignAssets: [pool.asset1.id, pool.asset2.id, pool.liquidity.id].filter(
        assetId => assetId !== config.native_asset.index
      ),
      params,
      sender: pool.address,
    }),
    // 3. Transfer of asset from swapper to pool
    createTransferTransaction(config, {
      amount: quote.sellAmountMax,
      assetId: quote.sellAssetId,
      params,
      receiver: pool.address,
      sender,
    }),
    // 4. Transfer of asset from pool to swapper
    createTransferTransaction(config, {
      amount: quote.buyAmountMin,
      assetId: quote.buyAssetId,
      params,
      receiver: sender,
      sender: pool.address,
    }),
  ]

  return algosdk.assignGroupID(transactions).map(transaction => {
    const address = algosdk.encodeAddress(transaction.from.publicKey)

    if (address === logicSigAddress) {
      return algosdk.signLogicSigTransactionObject(transaction, logicSig).blob
    }

    return transaction
  })
}
