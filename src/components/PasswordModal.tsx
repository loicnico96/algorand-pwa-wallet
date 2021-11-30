import Modal from "react-modal"

import { PASSWORD_LENGTH, PASSWORD_REGEX } from "lib/utils/auth"

import { Form } from "./Form/Primitives/Form"
import { FormSubmit } from "./Form/Primitives/FormSubmit"
import { InputLabel } from "./Form/Primitives/InputLabel"
import { InputPassword } from "./Form/Primitives/InputPassword"
import { useForm } from "./Form/Primitives/useForm"
import { Button } from "./Primitives/Button"

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
  const { submitForm, isSubmitting, isValid, fieldProps, resetForm } = useForm({
    fields: {
      password: {
        minLength: PASSWORD_LENGTH,
        maxLength: PASSWORD_LENGTH,
        pattern: PASSWORD_REGEX,
        required: true,
        type: "string",
      },
    },
    initialValues: {
      password: "",
    },
    onSubmit: async ({ password }) => {
      resetForm()
      await onConfirm(password)
    },
  })

  return (
    <Modal isOpen={isOpen} onAfterOpen={resetForm} onRequestClose={onClose}>
      <Form onSubmit={submitForm}>
        <InputLabel name="password">
          {reason ?? "Enter your password"} (6 digits):
        </InputLabel>
        <InputPassword
          {...fieldProps.password}
          autoComplete="current-password"
          autoFocus
        />
        <Button onClick={onClose} label="Cancel" />
        <FormSubmit disabled={isSubmitting || !isValid} label="Confirm" />
      </Form>
    </Modal>
  )
}
