import { useRouter } from "next/router"

export function useRouteParam(key: string): string | null {
  const router = useRouter()
  const param = router.query[key]
  return (Array.isArray(param) ? param[0] : param) ?? null
}
