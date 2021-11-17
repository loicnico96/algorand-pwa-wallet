export enum Route {
  ACCOUNT_CREATE = "/account/create",
  ACCOUNT_LIST = "/",
  ACCOUNT_RESTORE = "/account/restore",
  ACCOUNT_VIEW = "/account/[address]",
}

export function replaceParams<T extends Record<string, string>>(
  path: string,
  params: T
): string {
  return Object.keys(params).reduce(
    (result, key) => result.replace(`[${key}]`, params[key]),
    path
  )
}
