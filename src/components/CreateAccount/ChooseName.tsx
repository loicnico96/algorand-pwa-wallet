import { useCallback } from "react"

import { Form } from "components/Form/Primitives/Form"
import { InputLabel } from "components/Form/Primitives/InputLabel"
import { InputText } from "components/Form/Primitives/InputText"
import { InputTextArea } from "components/Form/Primitives/InputTextArea"
import { useForm } from "components/Form/Primitives/useForm"
import { Button } from "components/Primitives/Button"
import { useContact } from "hooks/storage/useContact"

const NAME_MAX_LENGTH = 20
const NOTE_MAX_LENGTH = 400

export interface ChooseNameProps {
  address: string
  onBack: () => Promise<void>
  onNext: () => Promise<void>
}

export function ChooseName({ address, onBack, onNext }: ChooseNameProps) {
  const { data: contactData, updateContact } = useContact(address)

  const { fieldProps, isValid, values } = useForm({
    fields: {
      name: {
        maxLength: NAME_MAX_LENGTH,
        required: true,
        type: "string",
      },
      note: {
        maxLength: NOTE_MAX_LENGTH,
        type: "string",
      },
    },
    defaultValues: {
      name: contactData.name ?? "",
      note: contactData.note ?? "",
    },
  })

  const submitForm = useCallback(async () => {
    await updateContact({
      name: values.name.trim(),
      note: values.note.trim() || undefined,
    })
    await onNext()
  }, [onNext, updateContact, values])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose a name for your account. This information will be stored on your
        device only.
      </p>
      <Form>
        <div>
          <InputLabel name="name">Name</InputLabel>
        </div>
        <div>
          <InputText
            {...fieldProps.name}
            autoComplete="username"
            autoFocus
            placeholder="Name"
          />
        </div>
        <div>
          <InputLabel name="note">Note</InputLabel>
        </div>
        <div>
          <InputTextArea {...fieldProps.note} placeholder="Note (optional)" />
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
