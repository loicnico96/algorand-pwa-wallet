import { useCallback } from "react"

import { PASSWORD_LENGTH, PASSWORD_REGEX } from "lib/utils/auth"

import { Form } from "./Form/Primitives/Form"
import { InputLabel } from "./Form/Primitives/InputLabel"
import { InputPassword } from "./Form/Primitives/InputPassword"
import { useForm } from "./Form/Primitives/useForm"
import { Button } from "./Primitives/Button"
import { Modal } from "./Primitives/Modal"

export interface PasswordModalProps {
  isOpen: boolean
  onConfirm: (password: string) => unknown
  onClose: () => unknown
  reason?: string
  zIndex: number
}

export function PasswordModal({
  onClose,
  onConfirm,
  reason,
  ...modal
}: PasswordModalProps) {
  const { fieldProps, isValid, resetForm, values } = useForm({
    fields: {
      password: {
        minLength: PASSWORD_LENGTH,
        maxLength: PASSWORD_LENGTH,
        pattern: PASSWORD_REGEX,
        required: true,
        type: "string",
      },
    },
    defaultValues: {
      password: "",
    },
  })

  const submitForm = useCallback(async () => {
    resetForm()
    await onConfirm(values.password)
  }, [onConfirm, resetForm, values])

  return (
    <Modal {...modal} name="password" onAfterOpen={resetForm} onClose={onClose}>
      <Form>
        <InputLabel name="password">
          {reason ?? "Enter your password"} (6 digits):
        </InputLabel>
        <InputPassword
          {...fieldProps.password}
          autoComplete="current-password"
          autoFocus
        />
        <Button onClick={onClose} label="Cancel" />
        <Button
          disabled={!isValid}
          label="Confirm"
          onClick={submitForm}
          type="submit"
        />
      </Form>
    </Modal>
  )
}
