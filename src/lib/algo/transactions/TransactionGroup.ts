import algosdk, { LogicSigAccount, Transaction } from "algosdk"

export type TransactionGroup = Array<Transaction | Uint8Array>

export function createTransactionGroup(
  ...transactions: Transaction[]
): TransactionGroup {
  return algosdk.assignGroupID(transactions)
}

export function getTransactionSigner(transaction: Transaction): string {
  return algosdk.encodeAddress(transaction.from.publicKey)
}

export function signTransaction(
  transaction: Transaction,
  key: Uint8Array | LogicSigAccount
): Uint8Array {
  if (key instanceof LogicSigAccount) {
    return algosdk.signLogicSigTransactionObject(transaction, key).blob
  } else {
    return transaction.signTxn(key)
  }
}

export function signTransactionGroup(
  transactionGroup: TransactionGroup,
  signer: string,
  key: Uint8Array | LogicSigAccount
): TransactionGroup {
  return transactionGroup.map(transaction => {
    if (transaction instanceof Transaction) {
      if (signer === getTransactionSigner(transaction)) {
        return signTransaction(transaction, key)
      }
    }

    return transaction
  })
}
