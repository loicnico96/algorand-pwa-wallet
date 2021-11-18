import { SuggestedParams } from "algosdk"
import { useNetworkContext } from "context/NetworkContext"
import { useQuery, UseQueryResult } from "./useQuery"

export function useTransactionParams(): UseQueryResult<SuggestedParams> {
  const { api, network } = useNetworkContext()

  return useQuery(`${network}:transactions/params`, () =>
    api.getTransactionParams().do()
  )
}
