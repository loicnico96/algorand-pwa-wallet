import algosdk from "algosdk"

import { toError } from "lib/utils/error"

import { AccountInfo, AccountStatus } from "./model"
import { getIndexerQuery } from "./query"

export async function getAccountInfo(
  indexer: algosdk.Indexer,
  address: string
): Promise<AccountInfo> {
  try {
    const query = indexer.lookupAccountByID(address)
    const result = await getIndexerQuery(query)
    return result.account as AccountInfo
  } catch (rawError) {
    const error = toError(rawError)

    if (error.message.match(/found/i)) {
      return {
        address,
        amount: 0,
        amountWithoutPendingRewards: 0,
        pendingRewards: 0,
        rewards: 0,
        round: 0,
        status: AccountStatus.EMPTY,
      }
    }

    throw error
  }
}

export function getCreatedApplications(account: AccountInfo): number[] {
  return account.createdApps?.map(app => app.id) ?? []
}

export function getCreatedAssets(account: AccountInfo): number[] {
  return account.createdAssets?.map(asset => asset.index) ?? []
}

export function getNonZeroAssets(account: AccountInfo): number[] {
  return (
    account.assets
      ?.filter(asset => asset.amount > 0)
      .map(asset => asset.assetId) ?? []
  )
}

export function getOptedInApplications(account: AccountInfo): number[] {
  return account.appsLocalState?.map(appState => appState.id) ?? []
}

export function getOptedInAssets(account: AccountInfo): number[] {
  return account.assets?.map(asset => asset.assetId) ?? []
}

export function hasOptedInApplication(
  account: AccountInfo,
  appId: number
): boolean {
  return (
    account.appsLocalState?.some(appState => appState.id === appId) ?? false
  )
}

export function hasOptedInAsset(
  account: AccountInfo,
  assetId: number
): boolean {
  return account.assets?.some(asset => asset.assetId === assetId) ?? false
}

export function isEmpty(account: AccountInfo): boolean {
  return account.status === AccountStatus.EMPTY
}
