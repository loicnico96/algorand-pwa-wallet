import algosdk, { SuggestedParams } from "algosdk"

export interface ApplicationCallTransactionParams {
  applicationId: number
  args?: string[]
  foreignAccounts?: string[]
  foreignApps?: number[]
  foreignAssets?: number[]
  params: SuggestedParams
  sender: string
}

export function createApplicationCallTransaction({
  applicationId,
  args,
  foreignAccounts,
  foreignApps,
  foreignAssets,
  params,
  sender,
}: ApplicationCallTransactionParams): algosdk.Transaction {
  return algosdk.makeApplicationNoOpTxnFromObject({
    accounts: foreignAccounts,
    appArgs: args?.map(arg => new TextEncoder().encode(arg)),
    appIndex: applicationId,
    foreignApps,
    foreignAssets,
    from: sender,
    suggestedParams: params,
  })
}
