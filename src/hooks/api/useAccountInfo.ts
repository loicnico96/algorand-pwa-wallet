import algosdk from "algosdk"
import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo, getAccountInfo } from "lib/algo/api"
import { useQuery, UseQueryResult } from "./useQuery"

export function useAccountInfo(
  address: string | null
): UseQueryResult<AccountInfo> {
  const { indexer } = useNetworkContext()

  const isValidAddress = address !== null && algosdk.isValidAddress(address)

  return useQuery(
    isValidAddress ? `api/accounts/${address}` : null,
    isValidAddress ? () => getAccountInfo(indexer, address) : null
  )
}
