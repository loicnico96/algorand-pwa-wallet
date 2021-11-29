import styled from "@emotion/styled"
import { ReactNode } from "react"

import { PageContent } from "./PageContent"
import { Spinner } from "./Primitives/Spinner"

export interface PageLoaderProps {
  children?: ReactNode
  message?: string
}

const Container = styled(PageContent)`
  align-items: center;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
`

export function PageLoader({ children, message }: PageLoaderProps) {
  return (
    <Container>
      <Spinner color="black" size={96} />
      {!!message && <span>{message}</span>}
      {children}
    </Container>
  )
}

export function renderLoader(message?: string): JSX.Element {
  return <PageLoader message={message} />
}
