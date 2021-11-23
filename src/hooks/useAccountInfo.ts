import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo, AccountStatus, SignatureType } from "lib/algo/Account"
import { toError } from "lib/utils/error"
import { useQuery, UseQueryResult } from "./useQuery"

export function useAccountInfo(
  address: string | null
): UseQueryResult<AccountInfo> {
  const { network, indexer } = useNetworkContext()

  return useQuery(
    address ? `${network}:accounts/${address}` : null,
    address
      ? async () => {
          try {
            const { account } = await indexer.lookupAccountByID(address).do()
            return account as AccountInfo
          } catch (error) {
            if (toError(error).message.match(/found/i)) {
              return {
                address,
                amount: 0,
                "amount-without-pending-rewards": 0,
                "sig-type": SignatureType.SINGLE,
                status: AccountStatus.EMPTY,
              }
            }

            throw error
          }
        }
      : null
  )
}
