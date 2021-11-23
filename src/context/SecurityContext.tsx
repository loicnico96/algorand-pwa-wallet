import AppStorage from "@randlabs/encrypted-local-storage"
import { PasswordModal } from "components/PasswordModal"
import { useContext, useMemo, useState } from "react"
import { createEmptyContext, ProviderProps } from "./utils"

export interface PasswordModalState {
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
  reason: string
}

export interface SecurityContextValue {
  addPrivateKey(
    address: string,
    password: string,
    key: Uint8Array
  ): Promise<void>
  changePassword(address: string): Promise<void>
  getPrivateKey(address: string): Promise<Uint8Array>
  hasPrivateKey(address: string): Promise<boolean>
  removePrivateKey(address: string): Promise<void>
}

export const SecurityContext = createEmptyContext<SecurityContextValue>()

export function SecurityContextProvider({ children }: ProviderProps) {
  const [modalState, setModalState] = useState<PasswordModalState>()

  const value = useMemo<SecurityContextValue>(() => {
    async function requestPassword<T>(
      reason: string,
      onConfirm: (password: string) => Promise<T>
    ): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        setModalState({
          onClose: () => {
            reject(Error("Cancelled"))
          },
          onConfirm: async password => {
            const result = await onConfirm(password)
            resolve(result)
          },
          reason,
        })
      })
    }

    async function addPrivateKey(
      address: string,
      password: string,
      key: Uint8Array
    ): Promise<void> {
      await AppStorage.savePrivatekeyToStorage(address, password, key)
    }

    async function hasPrivateKey(address: string): Promise<boolean> {
      const hasKey = AppStorage.hasItem(address)

      return hasKey
    }

    async function removePrivateKey(address: string): Promise<void> {
      await AppStorage.removeItem(address)
    }

    async function getPrivateKey(address: string): Promise<Uint8Array> {
      if (!(await AppStorage.hasItem(address))) {
        throw Error("Could not find private key for this account.")
      }

      const key = await requestPassword("Enter your password", password =>
        AppStorage.loadPrivatekeyFromStorage(address, password)
      )

      return key
    }

    async function changePassword(address: string): Promise<void> {
      if (!(await AppStorage.hasItem(address))) {
        throw Error("Could not find private key for this account.")
      }

      const key = await requestPassword(
        "Enter your current password",
        password => AppStorage.loadPrivatekeyFromStorage(address, password)
      )

      await requestPassword("Choose your new password", password =>
        AppStorage.savePrivatekeyToStorage(address, password, key)
      )
    }

    return {
      addPrivateKey,
      changePassword,
      getPrivateKey,
      hasPrivateKey,
      removePrivateKey,
    }
  }, [])

  return (
    <SecurityContext.Provider value={value}>
      <PasswordModal
        isOpen={!!modalState}
        onClose={() => {
          modalState?.onClose()
          setModalState(undefined)
        }}
        onConfirm={async password => {
          await modalState?.onConfirm(password)
          setModalState(undefined)
        }}
        reason={modalState?.reason}
      />
      {children}
    </SecurityContext.Provider>
  )
}

export function useSecurityContext(): SecurityContextValue {
  return useContext(SecurityContext)
}
