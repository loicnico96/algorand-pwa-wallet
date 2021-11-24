import AppStorage from "@randlabs/encrypted-local-storage"
import { ContactData } from "lib/storage/contacts"
import { isServer } from "lib/utils/environment"
import { useContext, useState } from "react"
import { createEmptyContext, ProviderProps } from "./utils"

export interface Storage {
  contacts: Record<string, ContactData>
}

export interface StorageContextValue {
  getItem<K extends keyof Storage>(key: K): Promise<Storage[K] | null>
  removeItem<K extends keyof Storage>(key: K): Promise<void>
  setItem<K extends keyof Storage>(key: K, data: Storage[K]): Promise<void>
  updateItem<K extends keyof Storage>(
    key: K,
    updateFn: (data: Storage[K] | null) => Storage[K]
  ): Promise<Storage[K]>
}

export const StorageContext = createEmptyContext<StorageContextValue>()

export const STORAGE_KEY = "storage"
export const STORAGE_KEY_CONTACTS = "contacts"

export function initStorage(): () => Promise<AppStorage> {
  let storage: AppStorage

  return async () => {
    if (isServer) {
      throw Error("IndexedDB is not available.")
    }

    if (!storage) {
      const storageKey = await AppStorage.getItem(STORAGE_KEY)
      if (storageKey) {
        storage = new AppStorage(storageKey)
      } else {
        storage = new AppStorage()
        await AppStorage.setItem(STORAGE_KEY, storage.getStorageKey())
      }
    }

    return storage
  }
}

export function StorageContextProvider({ children }: ProviderProps) {
  const [getStorage] = useState(initStorage)

  const value: StorageContextValue = {
    getItem: async key => {
      const storage = await getStorage()
      const data = await storage.loadItemFromStorage(key)
      return data
    },
    removeItem: async key => {
      await AppStorage.removeItem(key)
    },
    setItem: async (key, data) => {
      const storage = await getStorage()
      await storage.saveItemToStorage(key, data)
    },
    updateItem: async (key, updateFn) => {
      const storage = await getStorage()
      const data = updateFn(await storage.loadItemFromStorage(key))
      await storage.saveItemToStorage(key, data)
      return data
    },
  }

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  )
}

export function useStorage(): StorageContextValue {
  return useContext(StorageContext)
}
