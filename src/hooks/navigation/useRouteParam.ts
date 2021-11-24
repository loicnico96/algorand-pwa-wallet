import { RouteParam } from "lib/utils/navigation"
import { useRouter } from "next/router"

export function useRouteParam(key: RouteParam): string {
  const router = useRouter()
  const value = router.query[key]
  return Array.isArray(value) ? value.join("/") : value ?? ""
}
