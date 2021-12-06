import { useMemo } from "react"

import { Card } from "components/Primitives/Card"
import { CardList } from "components/Primitives/CardList"
import { AppLocalState } from "lib/algo/api"

import { AppListItem } from "./AppListItem"

export interface AppListProps {
  onOptIn?: () => Promise<void>
  onOptOut?: (appId: number) => Promise<void>
  apps: AppLocalState[]
}

export function AppList({ apps, onOptIn, onOptOut }: AppListProps) {
  const sortedApps = useMemo(
    () => apps.slice().sort((appA, appB) => appA.id - appB.id),
    [apps]
  )

  return (
    <CardList>
      {sortedApps.map(app => (
        <AppListItem app={app} key={app.id} onOptOut={onOptOut} />
      ))}
      {onOptIn && (
        <Card title="Add new dApp" onClick={onOptIn}>
          Add
        </Card>
      )}
    </CardList>
  )
}
