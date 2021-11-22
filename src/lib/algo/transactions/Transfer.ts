import algosdk, { SuggestedParams } from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

import { Address } from "../Account"
import { AssetId } from "../Asset"

export interface TransferTransactionParams {
  amount: number
  assetId?: AssetId
  note?: string
  params: SuggestedParams
  receiver: Address
  sender: Address
}

export function createTransferTransaction(
  config: NetworkConfig,
  { amount, assetId, note, params, receiver, sender }: TransferTransactionParams
): algosdk.Transaction {
  if (assetId === undefined || assetId === config.native_asset.index) {
    return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      amount,
      from: sender,
      note: note ? new TextEncoder().encode(note) : undefined,
      suggestedParams: params,
      to: receiver,
    })
  }

  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    amount,
    assetIndex: assetId,
    from: sender,
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams: params,
    to: receiver,
  })
}
