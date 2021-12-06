import { useCallback } from "react"

import { Card } from "components/Primitives/Card"
import { Modal } from "components/Primitives/Modal"
import { useNetworkContext } from "context/NetworkContext"
import { useAssetPrices } from "hooks/api/useAssetPrices"
import { useTransaction } from "hooks/api/useTransaction"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { getAccountInfo } from "lib/algo/api"
import { getPoolInfo } from "lib/tinyman/pool"
import { createRedeemTransaction, ExcessAmount } from "lib/tinyman/redeem"
import { printDecimals } from "lib/utils/int"

export interface RedeemExcessModalProps {
  address: string
  amounts: ExcessAmount[]
  isOpen: boolean
  close: () => void
}

export function RedeemExcessModal(props: RedeemExcessModalProps) {
  const { address, amounts, isOpen, close } = props

  const { config, indexer } = useNetworkContext()
  const { data: prices } = useAssetPrices()
  const { refetch: refetchParams } = useTransactionParams()
  const { sendTransaction } = useTransaction()

  const redeemAsset = useCallback(
    async (amount: ExcessAmount) => {
      const params = await refetchParams()
      const poolAccount = await getAccountInfo(indexer, amount.poolId)
      const pool = getPoolInfo(poolAccount, config)

      const transaction = createRedeemTransaction(config, {
        amount: amount.amount,
        assetId: amount.assetId,
        params,
        pool,
        sender: address,
      })

      await sendTransaction(transaction)
    },
    [address, config, indexer, refetchParams, sendTransaction]
  )

  return (
    <Modal isOpen={isOpen} name="excess-amount" onClose={close} zIndex={3000}>
      <div>You have {amounts.length} excess amounts to redeem.</div>
      {amounts.map(amount => {
        const assetPrice = prices?.[amount.assetId]

        return (
          <Card
            disabled={!assetPrice}
            key={`${amount.poolId}e${amount.assetId}`}
            onClick={() => redeemAsset(amount)}
          >
            {assetPrice
              ? `Redeem ${printDecimals(amount.amount, assetPrice.decimals)} ${
                  assetPrice.unit_name
                }`
              : "Loading..."}
          </Card>
        )
      })}
    </Modal>
  )
}
