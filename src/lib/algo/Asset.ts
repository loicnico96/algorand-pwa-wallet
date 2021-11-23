export interface AssetParams {
  clawback?: string
  creator: string
  decimals: number
  "default-frozen": boolean
  freeze?: string
  manager?: string
  "metadata-hash"?: string
  name?: string
  "name-b64"?: string
  reserve?: string
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
  index: number
  params: AssetParams
}
