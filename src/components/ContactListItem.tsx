import styled from "@emotion/styled"
import { useCallback } from "react"

import { Link } from "components/Link"
import { useContact } from "hooks/storage/useContact"
import { ContactData } from "lib/storage/contacts"
import { toClipboard } from "lib/utils/clipboard"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

import { AsyncButton } from "./AsyncButton"

export interface ContactListItemProps {
  address: string
  data: ContactData
}

const Container = styled.div`
  background-color: #ccc;
  border: 2px solid #444;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 16px;
`

const ContainerRow = styled.div`
  display: flex;
`

const Title = styled.div`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export function ContactListItem({ address, data }: ContactListItemProps) {
  const { removeContact, updateContact } = useContact(address)

  const onEditName = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Name", data.name)
    if (name !== null) {
      await updateContact({ name: name.trim() })
    }
  }, [updateContact, data])

  const onEditNote = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const note = window.prompt("Note", data.note)
    if (note !== null) {
      await updateContact({ note: note.trim() })
    }
  }, [updateContact, data])

  const accountUrl = replaceParams(Route.ACCOUNTS_VIEW, {
    [RouteParam.ADDRESS]: address,
  })

  return (
    <Link href={accountUrl} title={data.name ?? address}>
      <Container>
        <ContainerRow>
          <Title>
            <span
              title="Edit name"
              onClick={e => {
                e.preventDefault()
                return onEditName()
              }}
            >
              {data.name} (Edit name)
            </span>
          </Title>
          {!data.auth && (
            <AsyncButton
              label="Delete"
              onClick={removeContact}
              title="Delete this contact"
            />
          )}
        </ContainerRow>
        <ContainerRow>
          <span
            title="Edit note"
            onClick={e => {
              e.preventDefault()
              return onEditNote()
            }}
          >
            {data.note} (Edit note)
          </span>
        </ContainerRow>
        <ContainerRow>
          <Title>{address}</Title>
          <AsyncButton
            label="Copy"
            onClick={() => toClipboard(address)}
            title="Copy address to clipboard"
          />
        </ContainerRow>
      </Container>
    </Link>
  )
}
