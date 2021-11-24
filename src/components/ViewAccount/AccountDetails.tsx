import { useCallback } from "react"

import { useNetworkContext } from "context/NetworkContext"
import { useContact } from "hooks/storage/useContact"
import { AccountInfo } from "lib/algo/Account"
import { toClipboard } from "lib/utils/clipboard"

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
      <p>
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
        <a
          target="_blank"
          href={`${config.algo_explorer.url}/block/${account["created-at-round"]}`}
          rel="noreferrer"
        >
          {account["created-at-round"]}
        </a>
      </p>
      <p>
        <a
          target="_blank"
          href={`${config.algo_explorer.url}/address/${address}`}
          rel="noreferrer"
        >
          See in explorer
        </a>
      </p>
      <StandardAsset
        assetId={config.native_asset.index}
        amount={account.amount}
      />
      {account.assets?.map(asset => (
        <StandardAsset
          key={asset["asset-id"]}
          assetId={asset["asset-id"]}
          amount={asset.amount}
          frozen={asset["is-frozen"]}
        />
      ))}
    </div>
  )
}
