import algosdk from "algosdk"

import { NetworkConfig } from "context/NetworkContext"

import { AssetInfo } from "./model"
import { getIndexerQuery } from "./query"

export async function getAssetInfo(
  indexer: algosdk.Indexer,
  config: NetworkConfig,
  assetId: number
): Promise<AssetInfo> {
  if (assetId === config.native_asset.index) {
    return config.native_asset
  }

  const query = indexer.lookupAssetByID(assetId)
  const result = await getIndexerQuery(query)
  return result.asset as AssetInfo
}
