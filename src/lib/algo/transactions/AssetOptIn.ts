import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

export interface TransferTransactionParams {
  assetId: number
  params: SuggestedParams
  sender: string
}

export function createAssetOptInTransaction(
  config: NetworkConfig,
  { assetId, params, sender }: TransferTransactionParams
): algosdk.Transaction {
  if (assetId === config.native_asset.index) {
    throw Error(`Cannot opt in to ${config.native_asset.params.name}`)
  }

  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    amount: 0,
    assetIndex: assetId,
    from: sender,
    suggestedParams: params,
    to: sender,
  })
}
