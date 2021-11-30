import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

export interface TransferTransactionParams {
  amount: number
  assetId?: number
  close?: boolean
  note?: string
  params: SuggestedParams
  receiver: string
  sender: string
}

export function createTransferTransaction(
  config: NetworkConfig,
  {
    amount,
    assetId,
    close,
    note,
    params,
    receiver,
    sender,
  }: TransferTransactionParams
): algosdk.Transaction {
  if (assetId === undefined || assetId === config.native_asset.index) {
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
