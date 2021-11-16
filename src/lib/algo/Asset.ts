import { Address, AlgoIndexer } from "./AlgoIndexer"

export type AssetParams = {
  clawback: Address
  creator: Address
  decimals: number
  "default-frozen": boolean
  freeze: Address
  manager: Address
  "metadata-hash"?: string
  name?: string
  "name-b64"?: string
  reserve: Address
  total: number
  "unit-name"?: string
  "unit-name-b64"?: string
  url?: string
  "url-b64"?: string
}

export type AssetInfo = {
  "created-at-round": number
  deleted: boolean
  "destroyed-at-round": number
  index: number
  params: AssetParams
}

export async function getAssetInfo(assetId: number): Promise<AssetInfo> {
  const { asset } = await AlgoIndexer.lookupAssetByID(assetId).do()
  return asset as AssetInfo
}
