import { isDev } from "lib/utils/environment"
import { toError } from "lib/utils/error"
import { useCallback } from "react"
import useSWR from "swr"

export interface UseQueryResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
  refetch: () => Promise<T>
}

export function useQuery<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): UseQueryResult<T> {
  const { data, error, isValidating, mutate } = useSWR(cacheKey, async key => {
    if (isDev) {
      console.log(`[${key}] Query`)
    }

    try {
      const result = await fetcher()
      if (isDev) {
        console.log(`[${key}] Success`, result)
      }

      return result
    } catch (error) {
      if (isDev) {
        console.error(`[${key}]`, error)
      }

      throw error
    }
  })

  const refetch = useCallback(async () => {
    const params = await mutate(undefined, true)
    if (params === undefined) {
      throw Error("Failed to fetch")
    }

    return params
  }, [])

  return {
    data: data ?? null,
    error: error ? toError(error) : null,
    loading: isValidating,
    refetch,
  }
}
