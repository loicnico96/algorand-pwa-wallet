import { useState } from "react"
import Modal from "react-modal"

import { AsyncButton } from "./AsyncButton"

export interface PinModalProps {
  isOpen: boolean
  onConfirm: (pin: string) => unknown
  onClose: () => unknown
}

export function PinModal({ onClose, onConfirm, isOpen }: PinModalProps) {
  const [pin, setPin] = useState("")

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={() => setPin("")}
      onRequestClose={onClose}
    >
      <p>Enter your PIN (6 digits):</p>
      <input
        onChange={e => setPin(e.target.value)}
        type="password"
        value={pin}
      />
      <AsyncButton onClick={onClose} label="Cancel" />
      <AsyncButton onClick={() => onConfirm(pin)} label="Confirm" />
    </Modal>
  )
}
