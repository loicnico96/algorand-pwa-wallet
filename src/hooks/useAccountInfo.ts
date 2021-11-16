import { getAccountInfo } from "lib/algo/Account"
import useSWR from "swr"

export function useAccountInfo(address: string) {
  const {
    data: account,
    error,
    isValidating,
    mutate,
  } = useSWR(`/account/${address}`, () => getAccountInfo(address))

  return {
    account,
    error,
    isValidating,
    mutate,
  }
}
