import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo, Address } from "lib/algo/Account"
import useSWR from "swr"

export interface UseAccountInfoResult {
  account: AccountInfo | null
  error: Error | null
  isValidating: boolean
  revalidate: () => void
}

export function useAccountInfo(address: Address): UseAccountInfoResult {
  const { network, indexer } = useNetworkContext()

  const { data, error, isValidating, mutate } = useSWR(
    `${network}:accounts/${address}`,
    async key => {
      console.log("[SWR]", key)
      const { account } = await indexer.lookupAccountByID(address).do()
      return account as AccountInfo
    }
  )

  return {
    account: data ?? null,
    error,
    isValidating,
    revalidate: mutate,
  }
}
