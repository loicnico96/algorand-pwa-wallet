import {
  Account,
  AccountData,
  addAccount,
  getAccounts,
  removeAccount,
  updateAccount,
} from "lib/db/schema"
import { createEmptyContext, ProviderProps } from "./utils"
import { useContext } from "react"
import { useNetworkContext } from "./NetworkContext"
import { useQuery } from "hooks/useQuery"

export interface AddressBookContextValue {
  accounts: Account[]
  addAccount(address: string, data: AccountData): Promise<void>
  error: Error | null
  loading: boolean
  refetch(): Promise<Account[]>
  removeAccount(address: string): Promise<void>
  updateAccount(address: string, data: Partial<AccountData>): Promise<void>
}

export const AddressBookContext = createEmptyContext<AddressBookContextValue>()

export function AddressBookContextProvider({ children }: ProviderProps) {
  const { network } = useNetworkContext()

  const { data, error, loading, refetch } = useQuery(
    `${network}:contacts`,
    () => getAccounts(network),
    { immutable: true }
  )

  const value: AddressBookContextValue = {
    accounts: data ?? [],
    addAccount: async (address, data) => {
      await addAccount(network, address, data)
      await refetch()
    },
    error,
    loading,
    refetch,
    removeAccount: async address => {
      await removeAccount(network, address)
      await refetch()
    },
    updateAccount: async (address, data) => {
      await updateAccount(network, address, data)
      await refetch()
    },
  }

  return (
    <AddressBookContext.Provider value={value}>
      {children}
    </AddressBookContext.Provider>
  )
}

export function useAddressBook(): AddressBookContextValue {
  return useContext(AddressBookContext)
}

export function useAccountData(address: string | null): Account | null {
  const { accounts } = useAddressBook()
  return accounts.find(account => account.address === address) ?? null
}
