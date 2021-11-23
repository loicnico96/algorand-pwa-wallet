import AppStorage from "@randlabs/encrypted-local-storage"
import { AccountData } from "lib/storage/schema"
import { useContext, useState } from "react"
import { createEmptyContext, ProviderProps } from "./utils"

export interface Storage {
  accounts: Record<string, AccountData>
}

export interface StorageContextValue {
  getItem<K extends keyof Storage>(key: K): Promise<Storage[K] | null>
  setItem<K extends keyof Storage>(key: K, item: Storage[K]): Promise<void>
}

export const StorageContext = createEmptyContext<StorageContextValue>()

export const STORAGE_KEY = "storage"

export async function initStorage(): Promise<AppStorage> {
  const storageKey = await AppStorage.getItem(STORAGE_KEY)
  if (storageKey) {
    return new AppStorage(storageKey)
  } else {
    const storage = new AppStorage()
    AppStorage.setItem(STORAGE_KEY, storage.getStorageKey())
    return storage
  }
}

export function StorageContextProvider({ children }: ProviderProps) {
  const [storagePromise] = useState(initStorage)

  const value: StorageContextValue = {
    getItem: async key => {
      const storage = await storagePromise
      return storage.loadItemFromStorage(key)
    },
    setItem: async (key, item) => {
      const storage = await storagePromise
      return storage.saveItemToStorage(key, item)
    },
  }

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  )
}

export function useStorage(): StorageContextValue {
  return useContext(StorageContext)
}
