export enum Route {
  ACCOUNT_CREATE = "/accounts/create",
  ACCOUNT_LIST = "/",
  ACCOUNT_RESTORE = "/accounts/restore",
  ACCOUNT_VIEW = "/accounts/[address]",
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
