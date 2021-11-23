import { AccountData } from "lib/storage/schema"
import { createEmptyContext, ProviderProps } from "./utils"
import { useContext } from "react"
import { useQuery } from "hooks/useQuery"
import { useStorage } from "./StorageContext"

export interface AddressBookContextValue {
  accounts: Record<string, AccountData>
  error: Error | null
  loading: boolean
  refetch(): Promise<Record<string, AccountData>>
  removeAccount(address: string): Promise<void>
  updateAccount(address: string, data: AccountData): Promise<void>
}

export const AddressBookContext = createEmptyContext<AddressBookContextValue>()

export function AddressBookContextProvider({ children }: ProviderProps) {
  const { getItem, setItem } = useStorage()

  const { data, error, loading, refetch } = useQuery(
    "storage/accounts",
    async () => {
      const value = await getItem("accounts")
      return value ?? {}
    },
    { immutable: true }
  )

  const value: AddressBookContextValue = {
    accounts: data ?? {},
    error,
    loading,
    refetch,
    removeAccount: async address => {
      const newData = await refetch()
      delete newData[address]
      await setItem("accounts", newData)
      await refetch()
    },
    updateAccount: async (address, accountData) => {
      const newData = await refetch()
      await setItem("accounts", {
        ...newData,
        [address]: {
          ...newData[address],
          ...accountData,
        },
      })
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

export function useAccountData(address: string | null): AccountData | null {
  const { accounts } = useAddressBook()
  return address ? accounts[address] ?? null : null
}
