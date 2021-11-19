import { toError } from "lib/utils/error"
import { createLogger } from "lib/utils/logger"
import { useCallback } from "react"
import useSWR from "swr"

export interface UseQueryOptions {
  immutable?: boolean
}

export interface UseQueryResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
  refetch: () => Promise<T>
}

export function useQuery<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const { data, error, isValidating, mutate } = useSWR(
    cacheKey,
    async key => {
      const logger = createLogger(key)
      try {
        const result = await fetcher()
        logger.log("Success", result)
        return result
      } catch (error) {
        logger.error(error)
        throw error
      }
    },
    {
      revalidateIfStale: !options.immutable,
      revalidateOnFocus: !options.immutable,
      revalidateOnReconnect: !options.immutable,
    }
  )

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
