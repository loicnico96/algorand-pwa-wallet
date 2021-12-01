import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"
import { encodeBase64 } from "lib/utils/encoding"

import { AccountAppState, AccountInfo } from "../Account"

import { createApplicationCallTransaction } from "./ApplicationCall"
import { createTransferTransaction } from "./Transfer"

export const SWAP_FEE = 0.003

export enum SwapMode {
  FIXED_INPUT = "fi",
  FIXED_OUTPUT = "fo",
}

export interface TransferTransactionParams {
  inAmount: number
  inAssetId: number
  mode: SwapMode
  outAmount: number
  outAssetId: number
  params: SuggestedParams
  pool: string
  sender: string
}

export interface PoolInfo {
  address: string
  algoBalance: number
  asset1: {
    id: number
    reserves: number
  }
  asset2: {
    id: number
    reserves: number
  }
  liquidity: {
    id: number
    issued: number
  }
  protocolFees: number
}

export function getLocalAppState(
  account: AccountInfo,
  appId: number
): AccountAppState | null {
  return account["apps-local-state"]?.find(state => state.id === appId) ?? null
}

export function getStateBytes(state: AccountAppState, key: string): string {
  return state["key-value"]?.find(kv => kv.key === key)?.value.bytes ?? ""
}

export function getStateUint(state: AccountAppState, key: string): number {
  return state["key-value"]?.find(kv => kv.key === key)?.value.uint ?? 0
}

export function getPoolInfo(
  account: AccountInfo,
  config: NetworkConfig
): PoolInfo {
  const appState = getLocalAppState(account, config.tinyman.validator_app_id)
  const liquidityAsset = account["created-assets"]?.at(0)

  if (!appState || !liquidityAsset) {
    throw Error("Not a valid pool")
  }

  const idAsset1 = getStateUint(appState, encodeBase64("a1"))
  const idAsset2 = getStateUint(appState, encodeBase64("a2"))
  const reservesAsset1 = getStateUint(appState, encodeBase64("s1"))
  const reservesAsset2 = getStateUint(appState, encodeBase64("s2"))
  const liquidityAssetId = liquidityAsset.index
  const liquidityIssued = getStateUint(appState, encodeBase64("ilt"))
  const protocolFees = getStateUint(appState, encodeBase64("p"))

  return {
    address: account.address,
    algoBalance: account.amount,
    asset1: {
      id: idAsset1,
      reserves: reservesAsset1,
    },
    asset2: {
      id: idAsset2,
      reserves: reservesAsset2,
    },
    liquidity: {
      id: liquidityAssetId,
      issued: liquidityIssued,
    },
    protocolFees,
  }
}

export function getPoolReserves(pool: PoolInfo, assetId: number): number {
  switch (assetId) {
    case pool.asset1.id:
      return pool.asset1.reserves
    case pool.asset2.id:
      return pool.asset2.reserves
    default:
      throw Error(`Asset ${assetId} is not part of this pool.`)
  }
}

export function getSwapQuote({
  pool,
  sellAssetId,
  buyAssetId,
  amount,
  swapMode,
  slippage = 0,
}: {
  pool: PoolInfo
  sellAssetId: number
  buyAssetId: number
  amount: number
  swapMode: SwapMode
  slippage: number
}): {
  buyAmount: number
  buyAmountMin: number
  buyAssetId: number
  buyRate: number
  buyReserves: number
  feeAmount: number
  feeAssetId: number
  feeRate: number
  marketRate: number
  priceImpact: number
  sellAmount: number
  sellAmountMax: number
  sellAssetId: number
  sellRate: number
  sellReserves: number
  swapMode: SwapMode
} {
  const sellReserves = getPoolReserves(pool, sellAssetId)

  const buyReserves = getPoolReserves(pool, buyAssetId)

  const marketRate = sellReserves / buyReserves

  let buyAmount: number
  let buyAmountMin: number
  let buyRate: number
  let sellAmount: number
  let sellAmountMax: number
  let sellRate: number

  if (swapMode === SwapMode.FIXED_INPUT) {
    sellAmount = amount
    sellAmountMax = amount
    sellRate = (sellReserves + sellAmount) / buyReserves
    buyAmount = Math.floor((sellAmount / sellRate) * (1 - SWAP_FEE))
    buyAmountMin = Math.floor(buyAmount * (1 - slippage))
    buyRate = 1 / sellRate
  } else {
    buyAmount = amount
    buyAmountMin = amount
    buyRate = (buyReserves - buyAmount) / sellReserves
    sellAmount = Math.floor(buyAmount / buyRate / (1 - SWAP_FEE))
    sellAmountMax = Math.floor(sellAmount / (1 - slippage))
    sellRate = 1 / buyRate
  }

  const priceImpact = sellRate / marketRate - 1

  const feeAmount = sellAmount * SWAP_FEE

  return {
    buyAmount,
    buyAmountMin,
    buyAssetId,
    buyRate,
    buyReserves,
    feeAmount,
    feeAssetId: sellAssetId,
    feeRate: SWAP_FEE,
    marketRate,
    priceImpact,
    sellAmount,
    sellAmountMax,
    sellAssetId,
    sellRate,
    sellReserves,
    swapMode,
  }
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
