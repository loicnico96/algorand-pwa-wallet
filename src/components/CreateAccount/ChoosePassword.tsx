import algosdk from "algosdk"

import { Form } from "components/Form/Primitives/Form"
import { FormSubmit } from "components/Form/Primitives/FormSubmit"
import { InputLabel } from "components/Form/Primitives/InputLabel"
import { InputPassword } from "components/Form/Primitives/InputPassword"
import { useForm } from "components/Form/Primitives/useForm"
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

  const { onSubmit, isSubmitting, isValid, values, setValue } = useForm({
    initialValues: {
      password: "",
    },
    onSubmit: async ({ password }) => {
      await addPrivateKey(account.addr, password, account.sk)
      await updateContact({ auth: AuthType.SINGLE })
      await onNext()
    },
    validators: {
      password: password => !!password.match(PASSWORD_REGEX),
    },
  })

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose your secret pasword (6 digits). It will be required to confirm
        transactions.
      </p>
      <Form onSubmit={onSubmit}>
        <div>
          <InputLabel name="password">Password</InputLabel>
        </div>
        <div>
          <InputPassword
            autoFocus
            name="password"
            onChange={value => setValue("password", value)}
            onKeyPress={e => {
              if (!e.key.match("[0-9]|Enter")) {
                e.preventDefault()
              }
            }}
            maxLength={PASSWORD_LENGTH}
            minLength={PASSWORD_LENGTH}
            pattern={PASSWORD_REGEX}
            required
            value={values.password}
          />
        </div>
        <FormSubmit disabled={isSubmitting || !isValid} label="Confirm" />
      </Form>
    </div>
  )
}
