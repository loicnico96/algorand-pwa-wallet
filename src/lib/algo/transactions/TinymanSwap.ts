import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

import { createApplicationCallTransaction } from "./ApplicationCall"
import { createTransferTransaction } from "./Transfer"

export enum TinymanSwapMode {
  FIXED_INPUT = "fi",
  FIXED_OUTPUT = "fo",
}

export interface TransferTransactionParams {
  inAmount: number
  inAssetId: number
  mode: TinymanSwapMode
  outAmount: number
  outAssetId: number
  params: SuggestedParams
  pool: string
  sender: string
}

export function createTinymanSwapTransaction(
  config: NetworkConfig,
  {
    inAmount,
    inAssetId,
    mode,
    outAmount,
    outAssetId,
    params,
    pool,
    sender,
  }: TransferTransactionParams
): algosdk.Transaction[] {
  const transactions = [
    // 1. Payment of fees from swapper to pool
    createTransferTransaction(config, {
      amount: config.params.MinTxnFee * 2,
      params,
      receiver: pool,
      sender,
    }),
    // 2. NoOp application call of Tinyman main validator
    createApplicationCallTransaction({
      applicationId: config.tinyman.validator_app_id,
      args: ["swap", mode],
      foreignAccounts: [sender],
      params,
      sender: pool,
    }),
    // 3. Transfer of asset from swapper to pool
    createTransferTransaction(config, {
      amount: inAmount,
      assetId: inAssetId,
      params,
      receiver: pool,
      sender,
    }),
    // 4. Transfer of asset from pool to swapper
    createTransferTransaction(config, {
      amount: outAmount,
      assetId: outAssetId,
      params,
      receiver: sender,
      sender: pool,
    }),
  ]

  const transactionGroup = algosdk.assignGroupID(transactions)

  return transactionGroup
}
