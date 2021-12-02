import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

export interface AssetTransferTransactionParams {
  amount: number
  assetId: number
  close?: boolean
  note?: string
  params: SuggestedParams
  receiver: string
  sender: string
}

export function createAssetTransferTransaction(
  config: NetworkConfig,
  {
    amount,
    assetId,
    close,
    note,
    params,
    receiver,
    sender,
  }: AssetTransferTransactionParams
): algosdk.Transaction {
  if (assetId === config.native_asset.index) {
    return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      amount,
      closeRemainderTo: close ? receiver : undefined,
      from: sender,
      note: note ? new TextEncoder().encode(note) : undefined,
      suggestedParams: params,
      to: receiver,
    })
  }

  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    amount,
    assetIndex: assetId,
    closeRemainderTo: close ? receiver : undefined,
    from: sender,
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams: params,
    to: receiver,
  })
}
