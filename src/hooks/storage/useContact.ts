import { ContactData } from "lib/storage/contacts"
import { useCallback } from "react"
import { useContacts } from "./useContacts"
import { UseQueryResult } from "../useQuery"

export interface UseContactResult extends UseQueryResult<ContactData> {
  data: ContactData
  removeContact(): Promise<void>
  updateContact(contactData: ContactData): Promise<void>
}

export function useContact(address: string | null): UseContactResult {
  const result = useContacts()

  const refetch = useCallback(async () => {
    if (address) {
      const data = await result.refetch()
      return data[address] ?? {}
    }

    return {}
  }, [address, result.refetch])

  const removeContact = useCallback(async () => {
    if (address) {
      await result.removeContact(address)
    }
  }, [address, result.removeContact])

  const updateContact = useCallback(
    async (contactData: ContactData) => {
      if (address) {
        await result.updateContact(address, contactData)
      }
    },
    [address, result.updateContact]
  )

  return {
    ...result,
    data: address !== null ? result.data[address] ?? {} : {},
    refetch,
    removeContact,
    updateContact,
  }
}
