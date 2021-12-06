import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import { createEmptyContext, ProviderProps } from "./utils"

export interface ModalContextValue {
  closeModal: (modal: string) => void
  modals: string[]
  openModal: (modal: string) => Promise<void>
}

export const ModalContext = createEmptyContext<ModalContextValue>()

export function ModalProvider({ children }: ProviderProps) {
  const [modals, setModals] = useState<string[]>([])

  const router = useRouter()

  const openModal = useCallback(
    async (modal: string) => {
      await router.push({ hash: modal }, undefined, { shallow: true })
      setModals(history => history.concat(modal))
    },
    [modals, router]
  )

  const closeModal = useCallback(
    (modal: string) => {
      const index = modals.indexOf(modal)
      if (index >= 0) {
        window.history.go(index - modals.length)
      }
    },
    [modals]
  )

  useEffect(() => {
    router.beforePopState(event => {
      const hash = event.as.split("#")[1]

      if (hash) {
        setModals(history => history.slice(0, history.indexOf(hash) + 1))
      } else {
        setModals([])
      }

      return true
    })
  }, [modals, router])

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModalContext(): ModalContextValue {
  return useContext(ModalContext)
}
