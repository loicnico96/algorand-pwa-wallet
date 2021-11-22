import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo, Address } from "lib/algo/Account"
import { useQuery, UseQueryResult } from "./useQuery"

export function useAccountInfo(
  address: Address | null
): UseQueryResult<AccountInfo> {
  const { network, indexer } = useNetworkContext()

  return useQuery(
    address ? `${network}:accounts/${address}` : null,
    address
      ? async () => {
          const { account } = await indexer.lookupAccountByID(address).do()
          return account as AccountInfo
        }
      : null
  )
}
