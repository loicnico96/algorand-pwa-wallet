export interface FormSubmitProps {
  autoFocus?: boolean
  disabled?: boolean
  label: string
}

export function FormSubmit({ label, ...props }: FormSubmitProps) {
  return (
    <input id="submit" title={label} type="submit" value={label} {...props} />
  )
}
