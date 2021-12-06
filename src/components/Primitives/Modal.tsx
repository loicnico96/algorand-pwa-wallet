import { ReactNode } from "react"
import ReactModal from "react-modal"

import { useModalContext } from "context/ModalContext"

export interface UseModalResult {
  close: () => void
  isOpen: boolean
  name: string
  open: () => Promise<void>
  zIndex: number
}

export interface ModalProps {
  children: ReactNode
  isOpen: boolean
  name: string
  onAfterClose?: () => void
  onAfterOpen?: () => void
  onClose: () => void
  zIndex?: number
}

ReactModal.setAppElement("#__next")

export function Modal({ name, onClose, zIndex, ...props }: ModalProps) {
  return (
    <ReactModal
      {...props}
      id={`modal-${name}`}
      onRequestClose={onClose}
      style={{ overlay: { zIndex } }}
    />
  )
}

export function useModal(name: string): UseModalResult {
  const { modals, openModal, closeModal } = useModalContext()

  const index = modals.indexOf(name)

  return {
    isOpen: index >= 0,
    name,
    open: () => openModal(name),
    close: () => closeModal(name),
    zIndex: index * 1000 + 3000,
  }
}
