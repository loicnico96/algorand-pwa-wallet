import algosdk from "algosdk"

import { toError } from "lib/utils/error"

import { AccountInfo, AppLocalState, AccountStatus } from "./model"
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

export function getAppLocalState(
  account: AccountInfo,
  appId: number
): AppLocalState | null {
  return account.appsLocalState?.find(state => state.id === appId) ?? null
}

export function getStateBytes(state: AppLocalState, key: string): string {
  return state.keyValue?.find(kv => kv.key === key)?.value.bytes ?? ""
}

export function getStateUint(state: AppLocalState, key: string): number {
  return state.keyValue?.find(kv => kv.key === key)?.value.uint ?? 0
}
