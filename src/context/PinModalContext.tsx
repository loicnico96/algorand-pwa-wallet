import algosdk from "algosdk"
import { PinModal } from "components/PinModal"
import { Address } from "lib/algo/Account"
import { PendingTransaction } from "lib/algo/Transaction"
import { getAccount } from "lib/db/schema"
import { decryptKey } from "lib/utils/auth"
import { toError } from "lib/utils/error"
import { useCallback, useContext, useState } from "react"
import { useNetworkContext } from "./NetworkContext"
import { createEmptyContext, ProviderProps } from "./utils"

export interface PinModalState {
  onClose: () => void
  onConfirm: (pin: string) => void
}

export interface PinModalContextValue {
  getPrivateKey(address: Address): Promise<Uint8Array>
}

export const PinModalContext = createEmptyContext<PinModalContextValue>()

export function PinModalContextProvider({ children }: ProviderProps) {
  const { network } = useNetworkContext()

  const [modalState, setModalState] = useState<PinModalState | null>(null)

  const getPrivateKey = useCallback(
    async (address: Address) => {
      const account = await getAccount(network, address)
      const encryptedKey = account?.key
      if (!encryptedKey) {
        throw Error("Private key not found.")
      }

      return new Promise<Uint8Array>((resolve, reject) => {
        setModalState({
          onClose: () => {
            reject(Error("Cancelled."))
          },
          onConfirm: pin => {
            const decryptedKey = decryptKey(encryptedKey, pin)
            resolve(decryptedKey)
          },
        })
      })
    },
    [network]
  )

  const value: PinModalContextValue = {
    getPrivateKey,
  }

  return (
    <PinModalContext.Provider value={value}>
      <PinModal
        isOpen={!!modalState}
        onClose={() => {
          if (modalState) {
            modalState.onClose()
            setModalState(null)
          }
        }}
        onConfirm={async pin => {
          if (modalState) {
            modalState.onConfirm(pin)
            setModalState(null)
          }
        }}
      />
      {children}
    </PinModalContext.Provider>
  )
}

export function usePinModal(): PinModalContextValue {
  return useContext(PinModalContext)
}
