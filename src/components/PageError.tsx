import styled from "@emotion/styled"
import { ReactNode } from "react"

import { PageContent } from "./PageContent"

export interface PageErrorProps {
  children?: ReactNode
  message: string
}

const Container = styled(PageContent)`
  align-items: center;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
`

export function PageError({ children, message }: PageErrorProps) {
  return (
    <Container>
      <span>{message}</span>
      {children}
    </Container>
  )
}

export function renderError(error: Error): JSX.Element {
  return <PageError message={`Error: ${error.message}`} />
}
