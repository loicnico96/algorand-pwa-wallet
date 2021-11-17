import { Address } from "./Account"

export type AssetId = number

export interface AssetParams {
  clawback?: Address
  creator: Address
  decimals: number
  "default-frozen": boolean
  freeze?: Address
  manager?: Address
  "metadata-hash"?: string
  name?: string
  "name-b64"?: string
  reserve?: Address
  total: number
  "unit-name"?: string
  "unit-name-b64"?: string
  url?: string
  "url-b64"?: string
}

export interface AssetInfo {
  "created-at-round": number
  deleted: boolean
  "destroyed-at-round"?: number
  index: AssetId
  params: AssetParams
}
