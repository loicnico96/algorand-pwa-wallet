import { useCallback } from "react"

import { useAddressBook } from "context/AddressBookContext"
import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/Account"
import { AccountData } from "lib/storage/schema"
import { toClipboard } from "lib/utils/clipboard"

import { StandardAsset } from "./StandardAsset"

export type AccountDetailsProps = {
  account: AccountInfo
  data: AccountData | null
}

export default function AccountDetails({ account, data }: AccountDetailsProps) {
  const { updateAccount } = useAddressBook()
  const { config } = useNetworkContext()
  const { address } = account

  const onChangeName = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt("Enter name:", data?.name)

    if (name) {
      await updateAccount(address, { name })
    }
  }, [address, data, updateAccount])

  const onChangeNote = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const note = window.prompt("Enter note:", data?.note)

    if (note) {
      await updateAccount(address, { note })
    }
  }, [address, data, updateAccount])

  return (
    <div>
      <p>
        <a
          onClick={() => toClipboard(account.address)}
          title="Copy to clipboard"
        >
          {account.address}
        </a>
      </p>
      {data?.name ? (
        <p>
          {data?.name} <a onClick={onChangeName}>(Edit name)</a>
        </p>
      ) : (
        <p>
          <a onClick={onChangeName}>(Add name)</a>
        </p>
      )}
      {data?.note ? (
        <p>
          {data?.note} <a onClick={onChangeNote}>(Edit note)</a>
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
          href={`${config.algo_explorer.url}/address/${account.address}`}
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
