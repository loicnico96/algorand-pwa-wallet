import { FormHTMLAttributes } from "react"

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  onSubmit: () => void
}

export function Form({ onSubmit, ...props }: FormProps) {
  return (
    <form
      {...props}
      onSubmit={event => {
        event.preventDefault()
        onSubmit()
      }}
    />
  )
}
