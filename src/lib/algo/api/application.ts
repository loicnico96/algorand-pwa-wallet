import { AccountInfo, AppLocalState } from "./model"

export function getAppLocalState(account: AccountInfo, appId: number) {
  return account.appsLocalState?.find(state => state.id === appId) ?? null
}

export function getStateBytes(
  state: AppLocalState,
  key: Buffer | string
): string {
  const keyStr = key.toString()
  const entry = state.keyValue?.find(kv => kv.key === keyStr)
  return entry?.value.bytes ?? ""
}

export function getStateUint(
  state: AppLocalState,
  key: Buffer | string
): number {
  const keyStr = key.toString()
  const entry = state.keyValue?.find(kv => kv.key === keyStr)
  return entry?.value.uint ?? 0
}
