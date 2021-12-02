import { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"
import { createApplicationCallTransaction } from "lib/algo/transactions/ApplicationCall"
import { createAssetTransferTransaction } from "lib/algo/transactions/AssetTransfer"
import {
  createTransactionGroup,
  signTransactionGroup,
  TransactionGroup,
} from "lib/algo/transactions/TransactionGroup"

import { getPoolLogicSig } from "../logicsig"
import { PoolInfo } from "../pool"

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
): TransactionGroup {
  // Generate smart signature for the given liquidity pool
  const logicSig = getPoolLogicSig(config, pool)
  const logicSigAddress = logicSig.address()

  // Ensure that the smart signature is correct
  if (logicSigAddress !== pool.address) {
    throw Error("Invalid transaction")
  }

  const transactionGroup = createTransactionGroup(
    // 1. Payment of fees from swapper to pool
    createAssetTransferTransaction(config, {
      amount: config.params.MinTxnFee * 2,
      assetId: config.native_asset.index,
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
    createAssetTransferTransaction(config, {
      amount: quote.sellAmountMax,
      assetId: quote.sellAssetId,
      params,
      receiver: pool.address,
      sender,
    }),
    // 4. Transfer of asset from pool to swapper
    createAssetTransferTransaction(config, {
      amount: quote.buyAmountMin,
      assetId: quote.buyAssetId,
      params,
      receiver: sender,
      sender: pool.address,
    })
  )

  // Sign pool transactions with smart signature
  return signTransactionGroup(transactionGroup, logicSigAddress, logicSig)
}
