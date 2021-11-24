import { useNetworkContext } from "context/NetworkContext"
import { toError } from "lib/utils/error"
import { createLogger } from "lib/utils/logger"
import { useCallback } from "react"
import useSWR from "swr"

export interface UseQueryOptions<T> {
  defaultValue?: T
  immutable?: boolean
  onError?: (error: Error) => unknown
  onSuccess?: (result: T) => unknown
  pollInterval?: number
}

export interface UseQueryResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
  refetch: () => Promise<T>
}

export function useQuery<T>(
  cacheKey: string | null,
  fetcher: (() => Promise<T>) | null,
  { defaultValue, immutable, pollInterval, ...options }: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const { network } = useNetworkContext()
  const { data, error, isValidating, mutate } = useSWR(
    `${network}:${cacheKey}`,
    fetcher &&
      (async key => {
        const logger = createLogger(key)
        try {
          const result = await fetcher()
          logger.log("Success", result)
          return result
        } catch (error) {
          logger.error(error)
          throw error
        }
      }),
    {
      ...options,
      fallbackData: defaultValue,
      refreshInterval: pollInterval,
      revalidateIfStale: !immutable,
      revalidateOnFocus: !immutable,
      revalidateOnReconnect: !immutable,
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
