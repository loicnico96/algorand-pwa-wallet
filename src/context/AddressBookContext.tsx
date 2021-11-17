import {
  Account,
  AccountData,
  addAccount,
  getAccounts,
  removeAccount,
  updateAccount,
} from "lib/db/schema"
import { createEmptyContext } from "lib/utils/context"
import { ReactNode, useContext } from "react"
import useSWR from "swr"
import { useNetworkContext } from "./NetworkContext"

export interface AddressBook {
  accounts: Account[]
  addAccount(address: string, data: AccountData): Promise<void>
  loading: boolean
  removeAccount(address: string): Promise<void>
  updateAccount(address: string, data: Partial<AccountData>): Promise<void>
}

export interface AddressBookContextProviderProps {
  children: ReactNode
}

export const AddressBookContext =
  createEmptyContext<AddressBook>("AddressBookContext")

export function AddressBookContextProvider({
  children,
}: AddressBookContextProviderProps) {
  const { network } = useNetworkContext()

  const { data, isValidating, mutate } = useSWR(
    `${network}:contacts`,
    () => getAccounts(network),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const value: AddressBook = {
    accounts: data ?? [],
    addAccount: async (address, data) => {
      await addAccount(network, address, data)
      await mutate()
    },
    loading: isValidating,
    removeAccount: async address => {
      await removeAccount(network, address)
      await mutate()
    },
    updateAccount: async (address, data) => {
      await updateAccount(network, address, data)
      await mutate()
    },
  }

  return (
    <AddressBookContext.Provider value={value}>
      {children}
    </AddressBookContext.Provider>
  )
}

export function useAddressBook(): AddressBook {
  return useContext(AddressBookContext)
}

export function useAccountData(address: string | null): Account | null {
  const { accounts } = useAddressBook()
  return accounts.find(account => account.address === address) ?? null
}
