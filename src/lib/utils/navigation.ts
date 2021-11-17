export enum Route {
  ACCOUNT_CREATE = "/account/create",
  ACCOUNT_LIST = "/",
  ACCOUNT_RESTORE = "/account/restore",
  ACCOUNT_VIEW = "/account/[address]",
}

export enum RouteParam {
  ADDRESS = "address",
}

export function replaceParams<T extends Record<RouteParam, string>>(
  path: string,
  params: T
): string {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(`[${key}]`, value),
    path
  )
}
