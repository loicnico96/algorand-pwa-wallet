export enum TransactionType {
  ASSET_TRANSFER = "axfer",
  TRANSFER = "pay",
}

export interface Transaction {
  amt?: number
  arcv?: Uint8Array
  asnd?: Uint8Array
  fee: number
  fv: number
  gen: string
  gh: Uint8Array
  lv: number
  rcv?: Uint8Array
  snd?: Uint8Array
  type: TransactionType
}

export interface SignedTransaction {
  sig: Uint8Array
  txn: Transaction
}

export interface PendingTransaction {
  "confirmed-round"?: number
  "pool-error"?: string
  txn: SignedTransaction
}
