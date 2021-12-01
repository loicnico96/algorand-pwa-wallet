import algosdk, { SuggestedParams } from "algosdk"

export interface ApplicationOptInTransactionParams {
  applicationId: number
  params: SuggestedParams
  sender: string
}

export function createApplicationOptInTransaction({
  applicationId,
  params,
  sender,
}: ApplicationOptInTransactionParams): algosdk.Transaction {
  return algosdk.makeApplicationOptInTxnFromObject({
    appIndex: applicationId,
    from: sender,
    suggestedParams: params,
  })
}
