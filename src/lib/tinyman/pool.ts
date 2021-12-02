import { NetworkConfig } from "context/NetworkContext"
import { AccountInfo, getAppLocalState, getStateUint } from "lib/algo/api"
import { encodeBase64 } from "lib/utils/encoding"

export interface PoolAssetInfo {
  amount: number
  id: number
}

export interface PoolInfo {
  address: string
  algoBalance: number
  asset1: PoolAssetInfo
  asset2: PoolAssetInfo
  liquidity: PoolAssetInfo
  protocolFees: number
}

export function getPoolInfo(
  account: AccountInfo,
  config: NetworkConfig
): PoolInfo {
  const appId = config.tinyman.validator_app_id
  const appState = getAppLocalState(account, appId)
  const liquidityAsset = account.createdAssets?.[0]

  if (!appState || !liquidityAsset) {
    throw Error("Not a valid pool")
  }

  return {
    address: account.address,
    algoBalance: account.amount,
    asset1: {
      amount: getStateUint(appState, encodeBase64("s1")),
      id: getStateUint(appState, encodeBase64("a1")),
    },
    asset2: {
      amount: getStateUint(appState, encodeBase64("s2")),
      id: getStateUint(appState, encodeBase64("a2")),
    },
    liquidity: {
      amount: getStateUint(appState, encodeBase64("ilt")),
      id: liquidityAsset.index,
    },
    protocolFees: getStateUint(appState, encodeBase64("p")),
  }
}

export function getPoolReserves(pool: PoolInfo, assetId: number): number {
  switch (assetId) {
    case pool.asset1.id:
      return pool.asset1.amount
    case pool.asset2.id:
      return pool.asset2.amount
    default:
      throw Error(`Asset ${assetId} is not part of this pool.`)
  }
}
