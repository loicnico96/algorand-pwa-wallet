import algosdk from "algosdk"
import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo, AccountStatus, SignatureType } from "lib/algo/Account"
import { toError } from "lib/utils/error"
import { useQuery, UseQueryResult } from "./useQuery"

export async function getAccountInfo(
  indexer: algosdk.Indexer,
  address: string
): Promise<AccountInfo> {
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
