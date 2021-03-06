export enum Route {
  ACCOUNTS_CREATE = "/accounts/create",
  ACCOUNTS_LIST = "/accounts",
  ACCOUNTS_RESTORE = "/accounts/restore",
  ACCOUNTS_VIEW = `/accounts/[address]`,
  CONTACTS = "/contacts",
  SEND = "/send",
  SWAP = "/swap",
}

export enum RouteParam {
  ADDRESS = "address",
  ADDRESS_FROM = "from",
  ADDRESS_TO = "to",
  AMOUNT = "amount",
  ASSET_ID = "asset",
  ASSET_ID_BUY = "buy",
  ASSET_ID_SELL = "sell",
  NOTE = "note",
  SLIPPAGE = "slippage",
  STEP = "step",
  SWAP_MODE = "mode",
}

export function replaceParams<T extends { [P in RouteParam]?: string }>(
  path: string,
  params: T
): string {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(`[${key}]`, value),
    path
  )
}

export function withSearchParams<T extends { [P in RouteParam]?: string }>(
  path: string,
  params: T
): string {
  const search = new URLSearchParams(params).toString()
  return search ? `${path}?${search}` : path
}
