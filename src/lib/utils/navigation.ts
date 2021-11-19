export enum Route {
  ACCOUNTS_CREATE = "/accounts/create",
  ACCOUNTS_LIST = "/accounts",
  ACCOUNTS_RESTORE = "/accounts/restore",
  ACCOUNTS_VIEW = "/accounts/[address]",
  CONTACTS = "/contacts",
}

export enum RouteParam {
  ADDRESS = "address",
  STEP = "step",
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
