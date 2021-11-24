import { STORAGE_KEY_CONTACTS, useStorage } from "context/StorageContext"
import { ContactData } from "lib/storage/contacts"
import { useCallback } from "react"
import { useQuery, UseQueryResult } from "hooks/api/useQuery"

export interface UseContactsResult
  extends UseQueryResult<Record<string, ContactData>> {
  data: Record<string, ContactData>
  removeContact(address: string): Promise<void>
  updateContact(address: string, contactData: ContactData): Promise<void>
}

export function useContacts(): UseContactsResult {
  const { getItem, updateItem } = useStorage()

  const result = useQuery(
    `storage/${STORAGE_KEY_CONTACTS}`,
    async () => {
      const value = await getItem(STORAGE_KEY_CONTACTS)
      return value ?? {}
    },
    {
      defaultValue: {},
      immutable: true,
    }
  )

  const removeContact = useCallback(
    async (address: string) => {
      await updateItem(STORAGE_KEY_CONTACTS, oldData => {
        const newData = oldData ?? {}
        delete newData[address]
        return newData
      })

      await result.refetch()
    },
    [result.refetch, updateItem]
  )

  const updateContact = useCallback(
    async (address: string, contactData: ContactData) => {
      await updateItem(STORAGE_KEY_CONTACTS, oldData => {
        const newData = oldData ?? {}
        newData[address] = { ...newData[address], ...contactData }
        return newData
      })

      await result.refetch()
    },
    [result.refetch, updateItem]
  )

  return {
    ...result,
    data: result.data ?? {},
    removeContact,
    updateContact,
  }
}
