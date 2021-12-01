import algosdk, { SuggestedParams } from "algosdk"

export interface ApplicationOptOutTransactionParams {
  applicationId: number
  force?: boolean
  params: SuggestedParams
  sender: string
}

export function createApplicationOptOutTransaction({
  applicationId,
  force,
  params,
  sender,
}: ApplicationOptOutTransactionParams): algosdk.Transaction {
  if (force) {
    return algosdk.makeApplicationClearStateTxnFromObject({
      appIndex: applicationId,
      from: sender,
      suggestedParams: params,
    })
  }

  return algosdk.makeApplicationCloseOutTxnFromObject({
    appIndex: applicationId,
    from: sender,
    suggestedParams: params,
  })
}
