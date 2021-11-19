import styled from "@emotion/styled"
import { ReactNode } from "react"

import { isError } from "lib/utils/error"

import { PageContent } from "./PageContent"

export interface PageErrorProps {
  children?: ReactNode
  error: Error | string
}

const Container = styled(PageContent)`
  align-items: center;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
`

export function PageError({ children, error }: PageErrorProps) {
  return (
    <Container>
      <span>{isError(error) ? `Error: ${error.message}` : error}</span>
      {children}
    </Container>
  )
}

export function renderError(error: Error | string): JSX.Element {
  return <PageError error={error} />
}
