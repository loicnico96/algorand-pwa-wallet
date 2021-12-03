import algosdk from "algosdk"
import { useMemo } from "react"

import { Button } from "components/Primitives/Button"
import { useNetworkContext } from "context/NetworkContext"
import { useAccountAssetIds } from "hooks/api/useAccountAssetIds"
import { useAccountBalance } from "hooks/api/useAccountBalance"
import { useAccountInfo } from "hooks/api/useAccountInfo"
import { useAccountMinBalance } from "hooks/api/useAccountMinBalance"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrices } from "hooks/api/useAssetPrices"
import { useTransaction } from "hooks/api/useTransaction"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { useContacts } from "hooks/storage/useContacts"
import {
  getAccountInfo,
  getAppLocalState,
  hasOptedInApplication,
  hasOptedInAsset,
} from "lib/algo/api"
import {
  createApplicationOptInTransaction,
  createApplicationOptOutTransaction,
  createAssetOptInTransaction,
} from "lib/algo/transactions"
import { getPoolInfo } from "lib/tinyman/pool"
import {
  createRedeemTransaction,
  ExcessAmount,
  getExcessAmounts,
} from "lib/tinyman/redeem"
import { createSwapTransaction, getSwapQuote, SwapMode } from "lib/tinyman/swap"
import { printDecimals } from "lib/utils/int"
import { RouteParam } from "lib/utils/navigation"

import { AccountSelect } from "./AccountSelect"
import { AmountSelect } from "./AmountSelect"
import { AssetSelect } from "./AssetSelect"
import { Form } from "./Primitives/Form"
import { FormSubmit } from "./Primitives/FormSubmit"
import { GroupLabel } from "./Primitives/GroupLabel"
import { InputGroup } from "./Primitives/InputGroup"
import { InputLabel } from "./Primitives/InputLabel"
import { InputText } from "./Primitives/InputText"
import { useForm } from "./Primitives/useForm"

export const ADDRESS_LENGTH = 58
export const ADDRESS_REGEX = /^[A-Z2-7]{58}$/

export function SwapForm() {
  const { config, indexer } = useNetworkContext()
  const { refetch: refetchParams } = useTransactionParams()
  const { sendTransaction } = useTransaction()
  const { data: prices } = useAssetPrices()

  const algoId = config.native_asset.index
  const algoDecimals = config.native_asset.params.decimals

  const { fieldProps, isSubmitting, isValid, mergeValues, submitForm, values } =
    useForm({
      fields: {
        amount: {
          min: 0,
          query: RouteParam.AMOUNT,
          required: true,
          type: "number",
        },
        buyAssetId: {
          min: 0,
          query: RouteParam.ASSET_ID_BUY,
          required: true,
          type: "number",
        },
        sellAssetId: {
          min: 0,
          query: RouteParam.ASSET_ID_SELL,
          required: true,
          type: "number",
        },
        sender: {
          maxLength: ADDRESS_LENGTH,
          minLength: ADDRESS_LENGTH,
          pattern: ADDRESS_REGEX,
          query: RouteParam.ADDRESS,
          required: true,
          type: "string",
        },
        slippage: {
          max: 10,
          min: 0,
          query: RouteParam.SLIPPAGE,
          required: true,
          type: "number",
        },
        swapMode: {
          pattern: /^fi|fo$/,
          query: RouteParam.SWAP_MODE,
          required: true,
          type: "string",
        },
      },
      defaultValues: {
        amount: 0,
        buyAssetId: algoId,
        sellAssetId: algoId,
        sender: "",
        swapMode: SwapMode.FI,
        slippage: 3,
      },
      onSubmit: async () => {
        const params = await refetchParams()
        const poolAddress =
          prices?.[values.sellAssetId]?.pools[values.buyAssetId]?.address

        if (!poolAddress) {
          throw Error("Invalid state")
        }

        const account = await getAccountInfo(indexer, poolAddress)

        const pool = getPoolInfo(account, config)

        const quote = getSwapQuote({
          ...values,
          pool,
          slippage: values.slippage / 1000,
          swapMode: values.swapMode as SwapMode,
        })

        const transaction = createSwapTransaction(config, {
          params,
          pool,
          quote,
          sender: values.sender,
        })

        await sendTransaction(transaction)
      },
    })

  const { sender, amount, buyAssetId, sellAssetId, slippage, swapMode } = values

  const isValidAddress = algosdk.isValidAddress(sender)

  const { data: contacts } = useContacts()
  const { data: accountInfo } = useAccountInfo(sender)
  const { data: sellAsset } = useAssetInfo(sellAssetId)
  const { data: buyAsset } = useAssetInfo(buyAssetId)

  const assetIds = useAccountAssetIds(accountInfo)

  const inBalance = useAccountBalance(accountInfo, sellAssetId)
  const outBalance = useAccountBalance(accountInfo, buyAssetId)

  const algoBalance = useAccountBalance(accountInfo, algoId)
  const algoMinBalance = useAccountMinBalance(accountInfo)
  const algoFee = config.params.MinTxnFee * 4

  const inPrice = prices?.[sellAssetId]
  const outPrice = prices?.[buyAssetId]

  const algoAvailable = Math.max(algoBalance - algoMinBalance - algoFee, 0)

  const pools = inPrice?.pools ?? {}
  const poolAddress = pools[buyAssetId]?.address ?? null

  const { data: poolAccount } = useAccountInfo(poolAddress)
  const pool = poolAccount && getPoolInfo(poolAccount, config)

  const quote =
    pool &&
    getSwapQuote({
      pool,
      sellAssetId,
      buyAssetId,
      amount,
      slippage: slippage / 1000,
      swapMode: swapMode as SwapMode,
    })

  const sellAmountAvailable = sellAssetId === algoId ? algoAvailable : inBalance

  const validatorAppId = config.tinyman.validator_app_id

  const excessAmounts = useMemo(() => {
    if (accountInfo) {
      const state = getAppLocalState(accountInfo, validatorAppId)
      if (state) {
        return getExcessAmounts(state)
      }
    }

    return null
  }, [accountInfo, validatorAppId])

  const isAbleToPayFee = algoBalance - algoMinBalance >= algoFee

  const isAbleToSubmit =
    isValid &&
    isValidAddress &&
    isAbleToPayFee &&
    accountInfo !== null &&
    sellAsset !== null &&
    buyAsset !== null &&
    quote !== null &&
    quote.sellAmountMax > 0 &&
    quote.sellAmountMax <= sellAmountAvailable &&
    quote.sellAssetId !== quote.buyAssetId &&
    quote.buyAmountMin > 0 &&
    quote.buyAmountMin <= quote.buyReserves &&
    hasOptedInApplication(accountInfo, validatorAppId) &&
    hasOptedInAsset(accountInfo, buyAssetId)

  const onOptIn = async () => {
    const params = await refetchParams()
    const transaction = createApplicationOptInTransaction({
      applicationId: validatorAppId,
      params,
      sender: values.sender,
    })

    await sendTransaction(transaction)
  }

  const onOptInAsset = async (assetId: number) => {
    const params = await refetchParams()
    const transaction = createAssetOptInTransaction(config, {
      assetId,
      params,
      sender: values.sender,
    })

    await sendTransaction(transaction)
  }

  const onOptOut = async () => {
    const params = await refetchParams()

    const transaction = createApplicationOptOutTransaction({
      applicationId: validatorAppId,
      params,
      sender: values.sender,
    })

    await sendTransaction(transaction)
  }

  const onRedeemExcessAmount = async (excessAmount: ExcessAmount) => {
    const account = await getAccountInfo(indexer, excessAmount.poolId)
    const params = await refetchParams()

    const transaction = createRedeemTransaction(config, {
      amount: excessAmount.amount,
      assetId: excessAmount.assetId,
      params,
      pool: getPoolInfo(account, config),
      sender: values.sender,
    })

    await sendTransaction(transaction)
  }

  return (
    <Form onSubmit={submitForm}>
      <InputGroup group="sender">
        <GroupLabel group="sender">Address</GroupLabel>
        <InputLabel name="sender">Address</InputLabel>
        <AccountSelect
          {...fieldProps.sender}
          accounts={contacts}
          allowManual
          onlyOwnAccounts
        />
        {!values.sender && (
          <div style={{ color: "red" }}>Please select an account.</div>
        )}
        {!!values.sender && !isValidAddress && (
          <div style={{ color: "red" }}>Invalid address.</div>
        )}
        {!!accountInfo && !isAbleToPayFee && (
          <div style={{ color: "red" }}>
            Not enough {config.native_asset.params.name}s to cover transaction
            fee.
          </div>
        )}
      </InputGroup>
      {isValidAddress && isAbleToPayFee && (
        <>
          <InputGroup group="sell">
            <GroupLabel group="sell">Exchange</GroupLabel>
            <div>
              <InputLabel name="sellAssetId">Asset</InputLabel>
              <AssetSelect
                {...fieldProps.sellAssetId}
                assets={assetIds.map(assetId => ({
                  assetId,
                  name: prices?.[assetId]?.name,
                }))}
                disabled={!isValidAddress}
                onChange={value => {
                  mergeValues({
                    amount: values.swapMode === SwapMode.FI ? 0 : amount,
                    sellAssetId: value,
                  })
                }}
                value={values.sellAssetId}
              />
            </div>
            {sellAmountAvailable === 0 && (
              <div style={{ color: "red" }}>
                Please select a different asset.
              </div>
            )}
            {sellAsset && quote && sellAmountAvailable > 0 && (
              <>
                <div>
                  <InputLabel name="inAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.amount}
                    decimals={sellAsset.params.decimals}
                    onChange={value => {
                      mergeValues({
                        amount: value,
                        swapMode: SwapMode.FI,
                      })
                    }}
                    unit={sellAsset.params.unitName}
                    value={quote.sellAmount}
                  />
                  <Button
                    label="Max"
                    onClick={() => {
                      mergeValues({
                        amount: sellAmountAvailable,
                        swapMode: SwapMode.FI,
                      })
                    }}
                    title="Set maximum amount"
                  />
                </div>
                {quote.sellAmountMax > sellAmountAvailable && (
                  <div style={{ color: "red" }}>
                    Not enough {sellAsset.params.unitName}.
                  </div>
                )}
                {inPrice && (
                  <>
                    <div>
                      <InputLabel name="inPrice">Price</InputLabel>
                      <AmountSelect
                        decimals={2}
                        disabled
                        name="inPrice"
                        unit="$"
                        value={inPrice.price * 10 ** 2}
                      />
                    </div>
                    <div>
                      <InputLabel name="inValue">Value</InputLabel>
                      <AmountSelect
                        decimals={2}
                        disabled
                        name="inValue"
                        unit="$"
                        value={
                          (quote.sellAmount / 10 ** (inPrice.decimals - 2)) *
                          inPrice.price
                        }
                      />
                    </div>
                  </>
                )}
                <div>
                  <InputLabel name="inBalance">Balance</InputLabel>
                  <AmountSelect
                    decimals={sellAsset.params.decimals}
                    disabled
                    name="inBalance"
                    unit={sellAsset.params.unitName}
                    value={inBalance}
                  />
                </div>
                {sellAssetId === algoId && (
                  <div>
                    <InputLabel name="inAvailable">Available</InputLabel>
                    <AmountSelect
                      decimals={algoDecimals}
                      disabled
                      name="inAvailable"
                      unit={config.native_asset.params.unitName}
                      value={algoAvailable}
                    />
                  </div>
                )}
              </>
            )}
          </InputGroup>
          <Button
            disabled={sellAssetId === buyAssetId}
            label="Swap assets"
            onClick={() => {
              mergeValues({
                buyAssetId: sellAssetId,
                sellAssetId: buyAssetId,
                swapMode: swapMode === SwapMode.FI ? SwapMode.FO : SwapMode.FI,
              })
            }}
          />
          <InputGroup group="buy">
            <GroupLabel group="buy">For</GroupLabel>
            <div>
              <InputLabel name="buyAssetId">Asset</InputLabel>
              <AssetSelect
                {...fieldProps.buyAssetId}
                assets={Object.keys(pools)
                  .map(Number)
                  .map(assetId => ({
                    assetId,
                    name: prices?.[assetId]?.name,
                  }))}
                disabled={!isValidAddress}
                onChange={value => {
                  mergeValues({
                    amount: swapMode === SwapMode.FO ? 0 : amount,
                    buyAssetId: value,
                  })
                }}
                value={values.buyAssetId}
              />
            </div>
            {buyAssetId === sellAssetId && (
              <div style={{ color: "red" }}>
                Please select a different asset.
              </div>
            )}
            {buyAsset &&
              buyAssetId !== sellAssetId &&
              quote &&
              sellAmountAvailable > 0 && (
                <>
                  <div>
                    <InputLabel name="outAmount">Amount</InputLabel>
                    <AmountSelect
                      {...fieldProps.amount}
                      decimals={buyAsset.params.decimals}
                      onChange={value => {
                        mergeValues({
                          amount: value,
                          swapMode: SwapMode.FO,
                        })
                      }}
                      unit={buyAsset.params.unitName}
                      value={quote.buyAmount}
                    />
                  </div>
                  {outPrice && (
                    <>
                      <div>
                        <InputLabel name="outPrice">Price</InputLabel>
                        <AmountSelect
                          decimals={2}
                          disabled
                          name="outPrice"
                          unit="$"
                          value={outPrice.price * 10 ** 2}
                        />
                      </div>
                      <div>
                        <InputLabel name="outValue">Value</InputLabel>
                        <AmountSelect
                          decimals={2}
                          disabled
                          name="outValue"
                          unit="$"
                          value={
                            (quote.buyAmount / 10 ** (outPrice.decimals - 2)) *
                            outPrice.price
                          }
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <InputLabel name="outBalance">Balance</InputLabel>
                    <AmountSelect
                      decimals={buyAsset.params.decimals}
                      disabled
                      name="outBalance"
                      unit={buyAsset.params.unitName}
                      value={outBalance}
                    />
                  </div>
                  {buyAssetId === algoId && (
                    <div>
                      <InputLabel name="outAvailable">Available</InputLabel>
                      <AmountSelect
                        decimals={algoDecimals}
                        disabled
                        name="outAvailable"
                        unit={config.native_asset.params.unitName}
                        value={algoAvailable}
                      />
                    </div>
                  )}
                </>
              )}
          </InputGroup>
        </>
      )}
      {accountInfo &&
        sellAsset &&
        buyAsset &&
        sellAssetId !== buyAssetId &&
        quote !== null &&
        quote.sellAmount > 0 && (
          <InputGroup group="advanced">
            <GroupLabel group="advanced">Advanced</GroupLabel>
            <div>
              <InputLabel name="swapMode">Swap Mode</InputLabel>
              <InputText {...fieldProps.swapMode} disabled />
            </div>
            <div>
              <InputLabel name="slippage">Slippage Tolerance</InputLabel>
              <AmountSelect
                {...fieldProps.slippage}
                decimals={1}
                disabled={!isValidAddress}
                unit="%"
              />
            </div>
            <div>
              <InputLabel name="feeAlgo">Transaction Fee</InputLabel>
              <AmountSelect
                decimals={algoDecimals}
                disabled
                name="feeTxn"
                unit={config.native_asset.params.unitName}
                value={algoFee}
              />
            </div>
            <div>
              <InputLabel name="feeSwap">
                Swap Fee ({quote.feeRate * 100}%)
              </InputLabel>
              <AmountSelect
                decimals={sellAsset.params.decimals}
                disabled
                name="feeSwap"
                unit={sellAsset.params.unitName}
                value={quote.feeAmount}
              />
            </div>
            {swapMode === SwapMode.FI && (
              <div>
                <InputLabel name="outAmountFinal">Minimum received</InputLabel>
                <AmountSelect
                  decimals={buyAsset.params.decimals}
                  disabled
                  name="outAmountFinal"
                  unit={buyAsset.params.unitName}
                  value={quote.buyAmountMin}
                />
              </div>
            )}
            {swapMode === SwapMode.FO && (
              <div>
                <InputLabel name="inAmountFinal">Maximum sent</InputLabel>
                <AmountSelect
                  decimals={sellAsset.params.decimals}
                  disabled
                  name="inAmountFinal"
                  unit={sellAsset.params.unitName}
                  value={quote.sellAmountMax}
                />
              </div>
            )}
            <div>
              <InputLabel name="impact">Price Impact</InputLabel>
              <AmountSelect
                decimals={2}
                disabled
                name="impact"
                unit="%"
                value={quote.priceImpact * 10000}
              />
            </div>
          </InputGroup>
        )}
      <FormSubmit disabled={isSubmitting || !isAbleToSubmit} label="Swap" />
      {accountInfo && (
        <div>
          {hasOptedInApplication(accountInfo, validatorAppId) ? (
            <Button
              label="Opt out"
              onClick={onOptOut}
              title="Opt out of Tinyman application"
            />
          ) : (
            <Button
              label="Opt in"
              onClick={onOptIn}
              title="Opt in to Tinyman application"
            />
          )}
        </div>
      )}
      {accountInfo && buyAsset && !hasOptedInAsset(accountInfo, buyAssetId) && (
        <Button
          label={`Opt in ${buyAsset.params.name}`}
          onClick={() => onOptInAsset(buyAssetId)}
        />
      )}
      {excessAmounts && (
        <div>
          {excessAmounts.map(excessAmount => (
            <Button
              key={`${excessAmount.poolId}e${excessAmount.assetId}`}
              label={`Redeem ${printDecimals(
                excessAmount.amount,
                prices?.[excessAmount.assetId]?.decimals ?? 0
              )} ${prices?.[excessAmount.assetId]?.unit_name}`}
              onClick={() => onRedeemExcessAmount(excessAmount)}
            />
          ))}
        </div>
      )}
    </Form>
  )
}
