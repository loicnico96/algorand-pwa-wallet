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
