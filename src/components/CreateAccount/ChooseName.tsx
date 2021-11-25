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

  const { onSubmit, isSubmitting, isValid, values, setValue } = useForm({
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
    validators: {
      name: name => !!name.trim(),
    },
  })

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose a name for your account. This information will be stored on your
        device only.
      </p>
      <Form onSubmit={onSubmit}>
        <div>
          <InputLabel name="name">Name</InputLabel>
        </div>
        <div>
          <InputText
            autoFocus
            maxLength={NAME_MAX_LENGTH}
            name="name"
            onChange={value => setValue("name", value)}
            placeholder="Name"
            required
            value={values.name}
          />
        </div>
        <div>
          <InputLabel name="note">Note</InputLabel>
        </div>
        <div>
          <InputTextArea
            maxLength={NOTE_MAX_LENGTH}
            name="note"
            onChange={value => setValue("note", value)}
            placeholder="Note (optional)"
            value={values.note}
          />
        </div>
        <FormSubmit disabled={isSubmitting || !isValid} label="Confirm" />
      </Form>
    </div>
  )
}
