import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"
import { AppLocalState } from "lib/algo/api"
import {
  createApplicationCallTransaction,
  createAssetTransferTransaction,
  createTransactionGroup,
  TransactionGroup,
} from "lib/algo/transactions"
import { decodeBase64 } from "lib/utils/encoding"

import { signPoolTransaction } from "./logicsig"
import { PoolInfo } from "./pool"

export interface RedeemTransactionParams {
  amount: number
  assetId: number
  params: SuggestedParams
  pool: PoolInfo
  sender: string
}

export interface ExcessAmount {
  amount: number
  assetId: number
  poolId: string
}

export function getExcessAmounts(appState: AppLocalState): ExcessAmount[] {
  return (
    appState.keyValue?.map(entry => {
      const key = decodeBase64(entry.key)
      const amount = entry.value.uint
      const poolId = algosdk.encodeAddress(key.slice(0, 32))
      const assetId = Number(key.readBigUInt64BE(33))
      return { amount, assetId, poolId }
    }) ?? []
  )
}

export function createRedeemTransaction(
  config: NetworkConfig,
  { amount, assetId, params, pool, sender }: RedeemTransactionParams
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
      foreignAssets: [pool.asset1.id, pool.asset2.id, pool.liquidity.id].filter(
        id => id !== config.native_asset.index
      ),
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
