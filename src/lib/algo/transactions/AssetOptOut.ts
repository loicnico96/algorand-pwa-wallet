import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

export interface AssetOptOutTransactionParams {
  assetId: number
  params: SuggestedParams
  receiver: string
  sender: string
}

export function createAssetOptOutTransaction(
  config: NetworkConfig,
  { assetId, params, receiver, sender }: AssetOptOutTransactionParams
): algosdk.Transaction {
  if (assetId === config.native_asset.index) {
    throw Error(`Cannot opt out of ${config.native_asset.params.name}`)
  }

  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    amount: 0,
    assetIndex: assetId,
    closeRemainderTo: receiver,
    from: sender,
    suggestedParams: params,
    to: receiver,
  })
}
