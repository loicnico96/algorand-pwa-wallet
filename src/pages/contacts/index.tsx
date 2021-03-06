import { PageContent } from "components/PageContent"
import { Button } from "components/Primitives/Button"
import { Link } from "components/Primitives/Link"
import { ContactList } from "components/Widgets/ContactList"
import { useContacts } from "hooks/storage/useContacts"
import { Route } from "lib/utils/navigation"

export default function ContactsPage() {
  const { updateContact } = useContacts()

  const onAddContact = async () => {
    // eslint-disable-next-line no-alert
    const address = window.prompt("Address")
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name")

    if (address && name) {
      await updateContact(address, { name })
    }
  }

  return (
    <PageContent>
      <Link href={Route.ACCOUNTS_LIST}>Back</Link>
      <h3>Contacts:</h3>
      <ContactList />
      <div>
        <Button label="Add contact" onClick={onAddContact} />
      </div>
    </PageContent>
  )
}
