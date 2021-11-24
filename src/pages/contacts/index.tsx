import Link from "next/link"

import { AsyncButton } from "components/AsyncButton"
import { ContactList } from "components/ContactList"
import { PageContent } from "components/PageContent"
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
      <Link href={Route.ACCOUNTS_LIST}>
        <a>Back</a>
      </Link>
      <h3>Contacts:</h3>
      <ContactList />
      <div>
        <AsyncButton label="Add contact" onClick={onAddContact} />
      </div>
    </PageContent>
  )
}
