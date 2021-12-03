import { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"
import {
  createApplicationCallTransaction,
  createAssetTransferTransaction,
  createTransactionGroup,
  TransactionGroup,
} from "lib/algo/transactions"

import { signPoolTransaction } from "./logicsig"
import { PoolInfo } from "./pool"

export interface SwapTransactionParams {
  amount: number
  assetId: number
  params: SuggestedParams
  pool: PoolInfo
  sender: string
}

export function createRedeemTransaction(
  config: NetworkConfig,
  { amount, assetId, params, pool, sender }: SwapTransactionParams
): TransactionGroup {
  // https://docs.tinyman.org/integration/transactions/redeem
  const transactionGroup = createTransactionGroup(
    // 0. Payment of transaction fees from sender to pool
    createAssetTransferTransaction(config, {
      amount: config.params.MinTxnFee * 2,
      assetId: config.native_asset.index,
      params,
      receiver: pool.address,
      sender,
    }),
    // 1. NoOp application call of Tinyman main validator
    createApplicationCallTransaction({
      applicationId: config.tinyman.validator_app_id,
      args: ["redeem"],
      foreignAccounts: [sender],
      foreignAssets: [assetId].filter(id => id !== config.native_asset.index),
      params,
      sender: pool.address,
    }),
    // 3. Transfer of asset from pool to sender
    createAssetTransferTransaction(config, {
      amount,
      assetId,
      params,
      receiver: sender,
      sender: pool.address,
    })
  )

  // Sign pool transactions with smart signature
  return signPoolTransaction(transactionGroup, pool, config)
}
