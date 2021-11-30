import Modal from "react-modal"

import { PASSWORD_LENGTH, PASSWORD_REGEX } from "lib/utils/auth"

import { Form } from "./Form/Primitives/Form"
import { FormSubmit } from "./Form/Primitives/FormSubmit"
import { InputBase } from "./Form/Primitives/InputBase"
import { InputLabel } from "./Form/Primitives/InputLabel"
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
        type: "password",
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
        <InputBase
          {...fieldProps.password}
          allowKeys="[0-9]"
          autoComplete="off"
          autoFocus
        />
        <Button onClick={onClose} label="Cancel" />
        <FormSubmit disabled={isSubmitting || !isValid} label="Confirm" />
      </Form>
    </Modal>
  )
}
