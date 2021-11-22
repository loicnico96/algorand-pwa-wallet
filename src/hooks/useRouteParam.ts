import { RouteParam } from "lib/utils/navigation"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"

export function getRouteParam(
  query: ParsedUrlQuery,
  key: RouteParam
): string | null {
  const param = query[key]
  return (Array.isArray(param) ? param[0] : param) ?? null
}

export function useRouteParam(key: RouteParam): string | null {
  const router = useRouter()
  return getRouteParam(router.query, key)
}
