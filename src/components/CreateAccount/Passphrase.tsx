import styled from "@emotion/styled"

import { Form } from "components/Form/Primitives/Form"
import { FormSubmit } from "components/Form/Primitives/FormSubmit"
import { InputLabel } from "components/Form/Primitives/InputLabel"
import { InputText } from "components/Form/Primitives/InputText"
import { useForm } from "components/Form/Primitives/useForm"
import { handleGenericError } from "lib/utils/error"

export interface PassphaseProps {
  autoFocus?: boolean
  editable?: boolean | number[]
  initialValues: string[]
  onSubmit: (words: string[]) => Promise<void>
}

export const PASSPHRASE_LENGTH = 25
export const PASSPHRASE_REGEX = /^[a-z]+$/

const WordInputGroup = styled.div``

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

  const {
    values,
    isSubmitting,
    isValid,
    onSubmit: onFormSubmit,
    setValue,
  } = useForm({
    initialValues: { words: initialValues },
    onError: error => {
      handleGenericError(error)
      const el = document.getElementById(`input-word-${firstEditable}`)
      if (el?.getAttribute("disabled") === null) {
        el.focus()
      }
    },
    onSubmit: ({ words }) => onSubmit(words),
    validators: {
      words: words => words.every(word => word.match(PASSPHRASE_REGEX)),
    },
  })

  const setWord = (index: number, value: string) => {
    setValue(
      "words",
      values.words.map((w, i) => (i === index ? value : w))
    )
  }

  return (
    <Form onSubmit={onFormSubmit}>
      <WordInputGroup role="group">
        {values.words.map((word, index) => {
          const name = `word-${index}`
          const disabled = Array.isArray(editable)
            ? !editable.includes(index)
            : !editable

          return (
            <div key={index} title={`Word ${index + 1}`}>
              <WordInputLabel name={name}>{index + 1}</WordInputLabel>
              <InputText
                autoCapitalize="off"
                autoFocus={autoFocus && !disabled && index === firstEditable}
                autoSelect={!disabled}
                disabled={disabled}
                onChange={value => setWord(index, value)}
                onKeyPress={e => {
                  if (e.key === " ") {
                    e.preventDefault()
                  }

                  if (e.key === "Enter") {
                    e.preventDefault()

                    if (e.currentTarget.value.match(PASSPHRASE_REGEX)) {
                      // Focus next editable word
                      for (let i = index + 1; i < values.words.length; i++) {
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
                name={name}
                pattern={PASSPHRASE_REGEX}
                required={!disabled}
                value={word}
              />
              {word !== "" && !word.match(PASSPHRASE_REGEX) && (
                <WordInputError aria-live="polite">
                  Invalid character.
                </WordInputError>
              )}
            </div>
          )
        })}
      </WordInputGroup>
      <FormSubmit
        autoFocus={autoFocus && !editable}
        disabled={isSubmitting || !isValid}
        label="Confirm"
      />
    </Form>
  )
}
