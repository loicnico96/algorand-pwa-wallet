import { AssetInfo } from "./Asset"

export type AppSchema = {
  "num-byte-slice": number
  "num-uint": number
}

export type AppStateValue = {
  bytes: string
  type: number
  uint: number
}

export type AppStateEntry = {
  key: string
  value: AppStateValue
}

export type AppParams = {
  "approval-program": string
  "clear-state-program": string
  creator: string
  "global-state": AppStateEntry[]
  "global-state-schema": AppSchema
  "local-state-schema": AppSchema
}

export type AccountAppCreated = {
  "created-at-round": number
  deleted: boolean
  "deleted-at-round": number
  params: AppParams
}

export type AccountAppState = {
  "closed-out-at-round": number
  deleted: boolean
  id: number
  "key-value": AppStateEntry[]
  "opted-in-at-round": number
  schema: AppSchema
}

export type AccountAsset = {
  amount: number
  "asset-id": number
  creator: string
  deleted: boolean
  "is-frozen": boolean
  "opted-in-at-round": number
  "opted-out-at-round": number
}

export type AccountParticipation = {
  "selection-participation-key": string
  "vote-first-valid": number
  "vote-key-dilution": number
  "vote-last-valid": number
  "vote-participation-key": string
}

export type AccountInfo = {
  address: string
  amount: number
  "amount-without-pending-rewards": number
  "apps-local-state": []
  "apps-total-schema": AppSchema
  assets: AccountAsset[]
  "auth-addr": string
  "closed-at-round": number
  "created-apps": []
  "created-assets": AssetInfo[]
  "created-at-round": number
  deleted: boolean
  participation: AccountParticipation
  "pending-rewards": number
  "reward-base": number
  rewards: number
  round: number
  "sig-type": string
  status: string
}
