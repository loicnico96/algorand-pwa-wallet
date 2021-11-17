import { AssetId, AssetInfo } from "./Asset"

export type Address = string

export type AppId = number

export interface AppSchema {
  "num-byte-slice": number
  "num-uint": number
}

export interface AppStateValue {
  bytes: string
  type: number
  uint: number
}

export interface AppStateEntry {
  key: string
  value: AppStateValue
}

export interface AppParams {
  "approval-program": string
  "clear-state-program": string
  creator: Address
  "global-state": AppStateEntry[]
  "global-state-schema": AppSchema
  "local-state-schema": AppSchema
}

export interface AccountAppCreated {
  "created-at-round": number
  deleted: boolean
  "deleted-at-round"?: number
  params: AppParams
}

export interface AccountAppState {
  "closed-out-at-round"?: number
  deleted: boolean
  id: AppId
  "key-value"?: AppStateEntry[]
  "opted-in-at-round": number
  schema: AppSchema
}

export interface AccountAsset {
  amount: number
  "asset-id": AssetId
  creator: Address
  deleted: boolean
  "is-frozen": boolean
  "opted-in-at-round": number
  "opted-out-at-round"?: number
}

export interface AccountParticipation {
  "selection-participation-key": string
  "vote-first-valid": number
  "vote-key-dilution": number
  "vote-last-valid": number
  "vote-participation-key": string
}

export interface AccountInfo {
  address: Address
  amount: number
  "amount-without-pending-rewards": number
  "apps-local-state": AccountAppState[]
  "apps-total-schema": AppSchema
  assets: AccountAsset[]
  "auth-addr"?: Address
  "closed-at-round"?: number
  "created-apps"?: AccountAppCreated[]
  "created-assets"?: AssetInfo[]
  "created-at-round": number
  deleted: boolean
  participation?: AccountParticipation
  "pending-rewards": number
  "reward-base": number
  rewards: number
  round: number
  "sig-type": "sig"
  status: "Offline" | "Online"
}
