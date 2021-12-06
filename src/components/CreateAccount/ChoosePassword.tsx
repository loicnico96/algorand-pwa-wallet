import algosdk from "algosdk"
import { useCallback } from "react"

import { Form } from "components/Form/Primitives/Form"
import { InputLabel } from "components/Form/Primitives/InputLabel"
import { InputPassword } from "components/Form/Primitives/InputPassword"
import { useForm } from "components/Form/Primitives/useForm"
import { Button } from "components/Primitives/Button"
import { useSecurityContext } from "context/SecurityContext"
import { useContact } from "hooks/storage/useContact"
import { AuthType } from "lib/storage/contacts"
import { PASSWORD_LENGTH, PASSWORD_REGEX } from "lib/utils/auth"

export interface ChoosePasswordProps {
  account: algosdk.Account
  onBack: () => Promise<void>
  onNext: () => Promise<void>
}

export function ChoosePassword({
  account,
  onBack,
  onNext,
}: ChoosePasswordProps) {
  const { updateContact } = useContact(account.addr)
  const { addPrivateKey } = useSecurityContext()

  const { fieldProps, isValid, values } = useForm({
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
    await addPrivateKey(account.addr, values.password, account.sk)
    await updateContact({ auth: AuthType.SINGLE })
    await onNext()
  }, [account, addPrivateKey, onNext, updateContact, values])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose your secret pasword (6 digits). It will be required to confirm
        transactions.
      </p>
      <Form>
        <div>
          <InputLabel name="password">Password</InputLabel>
        </div>
        <div>
          <InputPassword
            {...fieldProps.password}
            autoComplete="new-password"
            autoFocus
          />
        </div>
        <Button
          disabled={!isValid}
          label="Confirm"
          onClick={submitForm}
          type="submit"
        />
      </Form>
    </div>
  )
}
