import { useCallback } from "react"

import { Link } from "components/Link"
import { AssetList } from "components/Widgets/AssetList"
import { useNetworkContext } from "context/NetworkContext"
import { useContact } from "hooks/storage/useContact"
import { AccountInfo } from "lib/algo/Account"
import { toClipboard } from "lib/utils/clipboard"
import { handleGenericError } from "lib/utils/error"

import { StandardAsset } from "./StandardAsset"

export type AccountDetailsProps = {
  account: AccountInfo
}

export default function AccountDetails({ account }: AccountDetailsProps) {
  const { address } = account
  const { data: contactData, updateContact } = useContact(address)
  const { config } = useNetworkContext()

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
        Created at block:{" "}
        <Link
          href={`${config.algo_explorer.url}/block/${account["created-at-round"]}`}
        >
          {account["created-at-round"]}
        </Link>
      </p>
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
        onOptIn={() => handleGenericError("Not implemented")}
      />
    </div>
  )
}
