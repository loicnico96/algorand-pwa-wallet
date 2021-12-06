import { useCallback, useState } from "react"

import { Interactive } from "components/Primitives/Interactive"
import { Link } from "components/Primitives/Link"
import { AppList } from "components/Widgets/AppList"
import { AssetList } from "components/Widgets/AssetList"
import { useNetworkContext } from "context/NetworkContext"
import { useTransaction } from "hooks/api/useTransaction"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { useContact } from "hooks/storage/useContact"
import { AccountInfo, AssetInfo } from "lib/algo/api"
import {
  createApplicationOptInTransaction,
  createApplicationOptOutTransaction,
  createAssetOptInTransaction,
  createAssetOptOutTransaction,
} from "lib/algo/transactions"
import { toClipboard } from "lib/utils/clipboard"

import { StandardAsset } from "./StandardAsset"

export type AccountDetailsProps = {
  account: AccountInfo
}

export enum AccountDetailsTab {
  APPLICATIONS = "applications",
  ASSETS = "assets",
}

export default function AccountDetails({ account }: AccountDetailsProps) {
  const { address } = account
  const { data: contactData, updateContact } = useContact(address)
  const { config } = useNetworkContext()
  const { sendTransaction } = useTransaction()
  const { refetch: refetchParams } = useTransactionParams()

  const [tab, setTab] = useState(AccountDetailsTab.ASSETS)

  const onChangeName = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Enter name:", contactData.name)

    if (name) {
      await updateContact({ name })
    }
  }, [contactData, updateContact])

  const onChangeNote = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const note = window.prompt("Enter note:", contactData.note)

    if (note) {
      await updateContact({ note })
    }
  }, [contactData, updateContact])

  const onAppOptIn = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const appIdStr = window.prompt("Enter dApp address:")
    if (appIdStr === null) {
      return
    }

    const appId = Number.parseInt(appIdStr, 10)

    if (Number.isNaN(appId) || appId < 0) {
      throw Error("Invalid dApp address")
    }

    if (account.appsLocalState?.some(state => state.id === appId)) {
      throw Error("Already opted-in this dApp")
    }

    const params = await refetchParams()

    const transaction = createApplicationOptInTransaction({
      applicationId: appId,
      params,
      sender: account.address,
    })

    await sendTransaction(transaction)
  }, [account, refetchParams, sendTransaction])

  const onAppOptOut = useCallback(
    async (appId: number, force?: boolean) => {
      const params = await refetchParams()

      const transaction = createApplicationOptOutTransaction({
        applicationId: appId,
        force,
        params,
        sender: account.address,
      })

      await sendTransaction(transaction)
    },
    [account, refetchParams, sendTransaction]
  )

  const onAssetOptIn = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const assetIdStr = window.prompt("Enter ASA ID:")
    if (assetIdStr === null) {
      return
    }

    const assetId = Number.parseInt(assetIdStr, 10)

    if (Number.isNaN(assetId) || assetId < 0) {
      throw Error("Invalid ASA ID")
    }

    if (account.assets?.some(asset => asset.assetId === assetId)) {
      throw Error("Already opted-in this asset")
    }

    const params = await refetchParams()

    const transaction = createAssetOptInTransaction(config, {
      assetId,
      params,
      sender: account.address,
    })

    await sendTransaction(transaction)
  }, [account, config, refetchParams, sendTransaction])

  const onAssetOptOut = useCallback(
    async (assetId: number, assetInfo: AssetInfo) => {
      const params = await refetchParams()

      const transaction = createAssetOptOutTransaction(config, {
        assetId,
        params,
        sender: account.address,
        receiver: assetInfo.params.creator,
      })

      await sendTransaction(transaction)
    },
    [account, config, refetchParams, sendTransaction]
  )

  return (
    <div>
      <p style={{ overflow: "hidden" }}>
        <a onClick={() => toClipboard(address)} title="Copy to clipboard">
          {address}
        </a>
      </p>
      {contactData.name ? (
        <p>
          {contactData.name} <a onClick={onChangeName}>(Edit name)</a>
        </p>
      ) : (
        <p>
          <a onClick={onChangeName}>(Add name)</a>
        </p>
      )}
      {contactData.note ? (
        <p>
          {contactData.note} <a onClick={onChangeNote}>(Edit note)</a>
        </p>
      ) : (
        <p>
          <a onClick={onChangeNote}>(Add note)</a>
        </p>
      )}
      <p>
        <Link href={`${config.algo_explorer.url}/address/${address}`}>
          See in explorer
        </Link>
      </p>
      <div>
        <Interactive
          onClick={() => setTab(AccountDetailsTab.ASSETS)}
          style={{
            fontWeight: tab === AccountDetailsTab.ASSETS ? "bold" : undefined,
          }}
        >
          Assets
        </Interactive>
        <Interactive
          onClick={() => setTab(AccountDetailsTab.APPLICATIONS)}
          style={{
            fontWeight:
              tab === AccountDetailsTab.APPLICATIONS ? "bold" : undefined,
          }}
        >
          Applications
        </Interactive>
      </div>
      <StandardAsset
        assetId={config.native_asset.index}
        amount={account.amount}
      />
      {tab === AccountDetailsTab.ASSETS && (
        <AssetList
          assets={account.assets ?? []}
          onOptIn={onAssetOptIn}
          onOptOut={onAssetOptOut}
        />
      )}
      {tab === AccountDetailsTab.APPLICATIONS && (
        <AppList
          apps={account.appsLocalState ?? []}
          onOptIn={onAppOptIn}
          onOptOut={onAppOptOut}
        />
      )}
    </div>
  )
}
