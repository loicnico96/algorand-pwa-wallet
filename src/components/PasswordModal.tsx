import { useCallback, useState } from "react"
import Modal from "react-modal"

import { PASSWORD_REGEX } from "lib/utils/auth"
import { handleGenericError, toError } from "lib/utils/error"

import { AsyncButton } from "./AsyncButton"

export interface PasswordModalProps {
  isOpen: boolean
  onConfirm: (password: string) => unknown
  onClose: () => unknown
  reason?: string
}

export function PasswordModal({
  onClose,
  onConfirm,
  isOpen,
  reason,
}: PasswordModalProps) {
  const [password, setPassword] = useState("")

  const onAfterOpen = useCallback(() => {
    setPassword("")
  }, [])

  const onSubmit = useCallback(async () => {
    try {
      await onConfirm(password)
    } catch (error) {
      handleGenericError(toError(error))
      setPassword("")
    }
  }, [onConfirm, password])

  return (
    <Modal isOpen={isOpen} onAfterOpen={onAfterOpen} onRequestClose={onClose}>
      <p>{reason ?? "Enter your password"} (6 digits):</p>
      <input
        onChange={e => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <AsyncButton onClick={onClose} label="Cancel" />
      <AsyncButton
        disabled={!password.match(PASSWORD_REGEX)}
        onClick={onSubmit}
        label="Confirm"
      />
    </Modal>
  )
}
