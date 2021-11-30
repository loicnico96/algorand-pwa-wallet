import { Form } from "components/Form/Primitives/Form"
import { FormSubmit } from "components/Form/Primitives/FormSubmit"
import { InputLabel } from "components/Form/Primitives/InputLabel"
import { InputText } from "components/Form/Primitives/InputText"
import { InputTextArea } from "components/Form/Primitives/InputTextArea"
import { useForm } from "components/Form/Primitives/useForm"
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

  const { isSubmitting, isValid, fieldProps, submitForm } = useForm({
    fields: {
      name: {
        maxLength: NAME_MAX_LENGTH,
        required: true,
      },
      note: {
        maxLength: NOTE_MAX_LENGTH,
      },
    },
    initialValues: {
      name: contactData.name ?? "",
      note: contactData.note ?? "",
    },
    onSubmit: async ({ name, note }) => {
      await updateContact({
        name: name.trim(),
        note: note.trim() || undefined,
      })
      await onNext()
    },
  })

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose a name for your account. This information will be stored on your
        device only.
      </p>
      <Form onSubmit={submitForm}>
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
        <FormSubmit disabled={isSubmitting || !isValid} label="Confirm" />
      </Form>
    </div>
  )
}
