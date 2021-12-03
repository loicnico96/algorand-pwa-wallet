import { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"
import {
  createApplicationCallTransaction,
  createAssetTransferTransaction,
  createTransactionGroup,
  TransactionGroup,
} from "lib/algo/transactions"

import { signPoolTransaction } from "./logicsig"
import { getPoolReserves, PoolInfo } from "./pool"

export const SWAP_FEE = 0.003

export enum SwapMode {
  FI = "fi",
  FO = "fo",
}

export interface SwapQuoteParams {
  amount: number
  buyAssetId: number
  pool: PoolInfo
  sellAssetId: number
  slippage: number
  swapMode: SwapMode
}

export interface SwapQuote {
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
}

export interface SwapTransactionParams {
  params: SuggestedParams
  pool: PoolInfo
  quote: SwapQuote
  sender: string
}

export function getSwapQuote({
  amount,
  buyAssetId,
  pool,
  sellAssetId,
  slippage,
  swapMode,
}: SwapQuoteParams): SwapQuote {
  const sellReserves = getPoolReserves(pool, sellAssetId)
  const buyReserves = getPoolReserves(pool, buyAssetId)

  const marketRate = sellReserves / buyReserves

  let buyAmount: number
  let buyAmountMin: number
  let buyRate: number
  let sellAmount: number
  let sellAmountMax: number
  let sellRate: number

  if (swapMode === SwapMode.FI) {
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

  return {
    buyAmount,
    buyAmountMin,
    buyAssetId,
    buyRate,
    buyReserves,
    feeAmount: sellAmount * SWAP_FEE,
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

export function createSwapTransaction(
  config: NetworkConfig,
  { params, pool, quote, sender }: SwapTransactionParams
): TransactionGroup {
  // https://docs.tinyman.org/integration/transactions/swap
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
      args: ["swap", quote.swapMode],
      foreignAccounts: [sender],
      foreignAssets: [pool.asset1.id, pool.asset2.id, pool.liquidity.id].filter(
        assetId => assetId !== config.native_asset.index
      ),
      params,
      sender: pool.address,
    }),
    // 2. Transfer of asset from sender to pool
    createAssetTransferTransaction(config, {
      amount: quote.sellAmountMax,
      assetId: quote.sellAssetId,
      params,
      receiver: pool.address,
      sender,
    }),
    // 3. Transfer of asset from pool to sender
    createAssetTransferTransaction(config, {
      amount: quote.buyAmountMin,
      assetId: quote.buyAssetId,
      params,
      receiver: sender,
      sender: pool.address,
    })
  )

  // Sign pool transactions with smart signature
  return signPoolTransaction(transactionGroup, pool, config)
}
