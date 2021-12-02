import { AccountInfo, AppLocalState } from "./model"

export function getAppLocalState(account: AccountInfo, appId: number) {
  return account.appsLocalState?.find(state => state.id === appId) ?? null
}

export function getStateBytes(state: AppLocalState, key: string): string {
  return state.keyValue?.find(kv => kv.key === key)?.value.bytes ?? ""
}

export function getStateUint(state: AppLocalState, key: string): number {
  return state.keyValue?.find(kv => kv.key === key)?.value.uint ?? 0
}
