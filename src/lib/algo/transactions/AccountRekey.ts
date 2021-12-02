import algosdk, { SuggestedParams } from "algosdk"

export interface AccountRekeyTransactionParams {
  params: SuggestedParams
  rekeyTo: string | null
  sender: string
}

export function createAccountRekeyTransaction({
  params,
  rekeyTo,
  sender,
}: AccountRekeyTransactionParams): algosdk.Transaction {
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    amount: 0,
    from: sender,
    rekeyTo: rekeyTo ?? sender,
    suggestedParams: params,
    to: sender,
  })
}

createAccountRekeyTransaction({
  params: {} as any,
  rekeyTo: null,
  sender: "sender",
})
