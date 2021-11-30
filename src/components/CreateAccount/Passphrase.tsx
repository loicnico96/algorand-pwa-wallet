import styled from "@emotion/styled"

import { Form } from "components/Form/Primitives/Form"
import { FormSubmit } from "components/Form/Primitives/FormSubmit"
import { InputGroup } from "components/Form/Primitives/InputGroup"
import { InputLabel } from "components/Form/Primitives/InputLabel"
import { InputText } from "components/Form/Primitives/InputText"
import { FieldOptions, useForm } from "components/Form/Primitives/useForm"
import { fill } from "lib/utils/arrays"
import { handleGenericError } from "lib/utils/error"

export interface PassphaseProps {
  autoFocus?: boolean
  editable?: boolean | number[]
  initialValues: string[]
  onSubmit: (words: string[]) => Promise<void>
}

export const PASSPHRASE_LENGTH = 25
export const PASSPHRASE_REGEX = /^[a-z]+$/

const FIELD_NAMES = fill(PASSPHRASE_LENGTH, index => `word-${index}`)

const WordInputLabel = styled(InputLabel)`
  display: inline-block;
  min-width: 2em;
`

const WordInputError = styled.span`
  margin-left: 0.5em;
  color: red;
`

export function Passphrase({
  autoFocus,
  editable,
  initialValues,
  onSubmit,
}: PassphaseProps) {
  const firstEditable = Array.isArray(editable) ? Math.min(...editable) : 0

  const { fieldProps, submitForm, isSubmitting, isValid } = useForm({
    fields: FIELD_NAMES.reduce((result, name) => {
      result[name] = {
        pattern: PASSPHRASE_REGEX,
        required: true,
      }

      return result
    }, {} as Record<string, FieldOptions>),
    initialValues: FIELD_NAMES.reduce((result, name, index) => {
      result[name] = initialValues[index]

      return result
    }, {} as Record<string, string>),
    onError: error => {
      handleGenericError(error)
      // Focus first editable word
      for (let i = 0; i < FIELD_NAMES.length; i++) {
        const el = document.getElementById(`input-word-${i}`)
        if (el?.getAttribute("disabled") === null) {
          el.focus()
          return
        }
      }
    },
    onSubmit: values => onSubmit(FIELD_NAMES.map(name => values[name])),
  })

  return (
    <Form autoComplete="off" onSubmit={submitForm}>
      <InputGroup group="words">
        {FIELD_NAMES.map((name, index) => {
          const props = fieldProps[name]
          const disabled = Array.isArray(editable)
            ? !editable.includes(index)
            : !editable

          return (
            <div key={name} title={`Word ${index + 1}`}>
              <WordInputLabel name={name}>{index + 1}</WordInputLabel>
              <InputText
                {...props}
                allowKeys="[^ ]"
                autoCapitalize="off"
                autoComplete="off"
                autoFocus={autoFocus && !disabled && index === firstEditable}
                autoSelect={!disabled}
                disabled={disabled}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault()

                    if (e.currentTarget.value.match(PASSPHRASE_REGEX)) {
                      // Focus next editable word
                      for (let i = index + 1; i < FIELD_NAMES.length; i++) {
                        const el = document.getElementById(`input-word-${i}`)
                        if (el?.getAttribute("disabled") === null) {
                          el.focus()
                          return
                        }
                      }

                      // Focus first invalid word
                      for (let i = 0; i < index; i++) {
                        const el = document.getElementById(`input-word-${i}`)
                        if (el?.getAttribute("disabled") === null) {
                          const elValue = el.getAttribute("value")
                          if (!elValue?.match(PASSPHRASE_REGEX)) {
                            el.focus()
                            return
                          }
                        }
                      }

                      // Focus submit button
                      const el = document.getElementById("submit")
                      if (el?.getAttribute("disabled") === null) {
                        el.focus()
                      }
                    } else {
                      e.currentTarget.select()
                    }
                  }
                }}
              />
              {props.value !== "" && !props.value.match(PASSPHRASE_REGEX) && (
                <WordInputError aria-live="polite">
                  Invalid character.
                </WordInputError>
              )}
            </div>
          )
        })}
      </InputGroup>
      <FormSubmit
        autoFocus={autoFocus && !editable}
        disabled={isSubmitting || !isValid}
        label="Confirm"
      />
    </Form>
  )
}
