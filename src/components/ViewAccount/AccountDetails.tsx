import { useCallback } from "react"
import { toast } from "react-toastify"

import { Link } from "components/Link"
import { AssetList } from "components/Widgets/AssetList"
import { useNetworkContext } from "context/NetworkContext"
import { useTransaction } from "hooks/api/useTransaction"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { useContact } from "hooks/storage/useContact"
import { AccountInfo } from "lib/algo/Account"
import { AssetInfo } from "lib/algo/Asset"
import { createAssetOptInTransaction } from "lib/algo/transactions/AssetOptIn"
import { createAssetOptOutTransaction } from "lib/algo/transactions/AssetOptOut"
import { toClipboard } from "lib/utils/clipboard"
import { createLogger } from "lib/utils/logger"

import { StandardAsset } from "./StandardAsset"

export type AccountDetailsProps = {
  account: AccountInfo
}

export default function AccountDetails({ account }: AccountDetailsProps) {
  const { address } = account
  const { data: contactData, updateContact } = useContact(address)
  const { config } = useNetworkContext()
  const { signTransaction, waitForConfirmation } = useTransaction()
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

    if (account.assets?.some(asset => asset["asset-id"] === assetId)) {
      throw Error("Already opted-in this asset")
    }

    const params = await refetchParams()

    const transaction = createAssetOptInTransaction(config, {
      assetId,
      params,
      sender: account.address,
    })

    const logger = createLogger("Transaction")

    try {
      logger.log("Sign", transaction)
      const transactionId = await signTransaction(transaction)
      logger.log(`Sent ${transactionId}`, transaction)
      toast.info("Transaction sent.")

      waitForConfirmation(transactionId).then(
        confirmed => {
          logger.log(`Confirmed ${transactionId}`, confirmed)
          toast.success("Transaction confirmed.")
        },
        error => {
          logger.error(error)
          toast.error("Transaction rejected.")
        }
      )
    } catch (error) {
      logger.error(error)
      toast.warn("Transaction aborted.")
    }
  }, [account, config, refetchParams, signTransaction, waitForConfirmation])

  const onOptOut = useCallback(
    async (assetId: number, assetInfo: AssetInfo) => {
      const params = await refetchParams()

      const transaction = createAssetOptOutTransaction(config, {
        assetId,
        params,
        sender: account.address,
        receiver: assetInfo.params.creator,
      })

      const logger = createLogger("Transaction")

      try {
        logger.log("Sign", transaction)
        const transactionId = await signTransaction(transaction)
        logger.log(`Sent ${transactionId}`, transaction)
        toast.info("Transaction sent.")

        waitForConfirmation(transactionId).then(
          confirmed => {
            logger.log(`Confirmed ${transactionId}`, confirmed)
            toast.success("Transaction confirmed.")
          },
          error => {
            logger.error(error)
            toast.error("Transaction rejected.")
          }
        )
      } catch (error) {
        logger.error(error)
        toast.warn("Transaction aborted.")
      }
    },
    [account, config, refetchParams, signTransaction, waitForConfirmation]
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
        onOptIn={onOptIn}
        onOptOut={onOptOut}
      />
    </div>
  )
}
