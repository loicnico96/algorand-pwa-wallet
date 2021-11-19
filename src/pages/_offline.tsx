import { PageError } from "components/PageError"

export default function OfflinePage() {
  return (
    <PageError message="Unable to connect.">
      <p>Check your Internet connection.</p>
    </PageError>
  )
}
