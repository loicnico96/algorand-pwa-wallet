import styled from "@emotion/styled"
import { useState } from "react"

import { Button } from "components/Primitives/Button"
import { Card } from "components/Primitives/Card"
import { AppLocalState } from "lib/algo/api"

export interface AppListItemProps {
  app: AppLocalState
  onOptOut?: (appId: number) => Promise<void>
}

const ContainerRow = styled.div`
  display: flex;
`

const Title = styled.div`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export function AppListItem({ app, onOptOut }: AppListItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      aria-expanded={expanded}
      onBlur={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      title={expanded ? undefined : "Click to expand"}
    >
      <ContainerRow>
        <Title>{app.id}</Title>
        {onOptOut && (
          <Button
            label="Remove"
            onClick={() => onOptOut(app.id)}
            title="Remove application"
          />
        )}
      </ContainerRow>
      <ContainerRow>
        {app.schema.numUint} Uints / {app.schema.numByteSlice} byte slices
      </ContainerRow>
      {expanded && <>Expanded</>}
    </Card>
  )
}
