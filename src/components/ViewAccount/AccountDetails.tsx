import { useCallback } from "react"

import { Link } from "components/Primitives/Link"
import { AssetList } from "components/Widgets/AssetList"
import { useNetworkContext } from "context/NetworkContext"
import { useTransaction } from "hooks/api/useTransaction"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { useContact } from "hooks/storage/useContact"
import { AccountInfo, AssetInfo } from "lib/algo/api"
import { createAssetOptInTransaction } from "lib/algo/transactions/AssetOptIn"
import { createAssetOptOutTransaction } from "lib/algo/transactions/AssetOptOut"
import { toClipboard } from "lib/utils/clipboard"

import { StandardAsset } from "./StandardAsset"

export type AccountDetailsProps = {
  account: AccountInfo
}

export default function AccountDetails({ account }: AccountDetailsProps) {
  const { address } = account
  const { data: contactData, updateContact } = useContact(address)
  const { config } = useNetworkContext()
  const { sendTransaction } = useTransaction()
  const { refetch: refetchParams } = useTransactionParams()

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

  const onOptIn = useCallback(async () => {
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

  const onOptOut = useCallback(
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
        <StandardAsset
          assetId={config.native_asset.index}
          amount={account.amount}
        />
      </div>
      <AssetList
        assets={account.assets ?? []}
        onOptIn={onOptIn}
        onOptOut={onOptOut}
      />
    </div>
  )
}
