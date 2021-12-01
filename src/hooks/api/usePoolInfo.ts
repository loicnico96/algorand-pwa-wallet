import { useNetworkContext } from "context/NetworkContext"
import { getPoolInfo, PoolInfo } from "lib/algo/transactions/TinymanSwap"
import { useAccountInfo } from "./useAccountInfo"
import { UseQueryResult } from "./useQuery"

export function usePoolInfo(address: string | null): UseQueryResult<PoolInfo> {
  const { data, error, loading, refetch } = useAccountInfo(address)
  const { config } = useNetworkContext()

  return {
    data: data && getPoolInfo(data, config),
    error,
    loading,
    refetch: () => refetch().then(account => getPoolInfo(account, config)),
  }
}
