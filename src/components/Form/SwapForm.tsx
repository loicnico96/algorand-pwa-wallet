import algosdk from "algosdk"
import { useMemo, useState } from "react"

import { Button } from "components/Primitives/Button"
import { Link } from "components/Primitives/Link"
import { RedeemExcessModal } from "components/Swap/ExcessAmount/RedeemExcessModal"
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
  createAssetOptInTransaction,
} from "lib/algo/transactions"
import { getPoolInfo } from "lib/tinyman/pool"
import { getExcessAmounts } from "lib/tinyman/redeem"
import { createSwapTransaction, getSwapQuote, SwapMode } from "lib/tinyman/swap"
import { printDecimals } from "lib/utils/int"
import { RouteParam } from "lib/utils/navigation"

import { AccountSelect } from "./AccountSelect"
import { AmountSelect } from "./AmountSelect"
import { AssetSelect } from "./AssetSelect"
import { Form } from "./Primitives/Form"
import { GroupLabel } from "./Primitives/GroupLabel"
import { InputGroup } from "./Primitives/InputGroup"
import { InputLabel } from "./Primitives/InputLabel"
import { InputNumber } from "./Primitives/InputNumber"
import { InputText } from "./Primitives/InputText"
import { useForm } from "./Primitives/useForm"

export const ADDRESS_LENGTH = 58
export const ADDRESS_REGEX = /^[A-Z2-7]{58}$/
export const MAX_EXCESS_AMOUNTS = 16

export function SwapForm() {
  const { config, indexer } = useNetworkContext()
  const { refetch: refetchParams } = useTransactionParams()
  const { sendTransaction } = useTransaction()
  const { data: prices } = useAssetPrices()

  const algoId = config.native_asset.index
  const algoDecimals = config.native_asset.params.decimals

  const { fieldProps, isValid, mergeValues, values } = useForm({
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
  })

  const submitForm = async () => {
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
  }

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

    return []
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
    excessAmounts.length < MAX_EXCESS_AMOUNTS &&
    hasOptedInApplication(accountInfo, validatorAppId) &&
    (buyAssetId === algoId || hasOptedInAsset(accountInfo, buyAssetId))

  const onOptInApplication = async () => {
    const params = await refetchParams()
    const transaction = createApplicationOptInTransaction({
      applicationId: validatorAppId,
      params,
      sender: values.sender,
    })

    await sendTransaction(transaction)
  }

  const [modal, setModal] = useState<"RedeemExcessModal">()

  const onOptInAsset = async (assetId: number) => {
    const params = await refetchParams()
    const transaction = createAssetOptInTransaction(config, {
      assetId,
      params,
      sender: values.sender,
    })

    await sendTransaction(transaction)
  }

  return (
    <Form>
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
        {accountInfo && !isAbleToPayFee && (
          <div style={{ color: "red" }}>
            Not enough {config.native_asset.params.name}s to cover transaction
            fee.
          </div>
        )}
        <RedeemExcessModal
          address={sender}
          amounts={excessAmounts}
          isOpen={modal === "RedeemExcessModal"}
          onClose={() => setModal(undefined)}
        />
        {accountInfo &&
          excessAmounts.length > 0 &&
          (excessAmounts.length < MAX_EXCESS_AMOUNTS ? (
            <div style={{ color: "orange" }}>
              You have {excessAmounts.length} excess amounts to redeem.{" "}
              <Link href="https://docs.tinyman.org/tinyman-amm-basics/slippage-and-excess">
                Learn more.
              </Link>
              <Button
                label="Redeem"
                onClick={() => setModal("RedeemExcessModal")}
              />
            </div>
          ) : (
            <div style={{ color: "red" }}>
              You have {excessAmounts.length} excess amounts to redeem.{" "}
              <Link href="https://docs.tinyman.org/tinyman-amm-basics/slippage-and-excess">
                Learn more.
              </Link>
              <Button
                label="Redeem"
                onClick={() => setModal("RedeemExcessModal")}
              />
            </div>
          ))}
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
                      <div>
                        <InputNumber
                          decimals={2}
                          disabled
                          name="inPrice"
                          value={inPrice.price}
                        />
                        $
                      </div>
                    </div>
                    <div>
                      <InputLabel name="inValue">Value</InputLabel>
                      <div>
                        <InputNumber
                          decimals={2}
                          disabled
                          name="inValue"
                          value={
                            (quote.sellAmount / 10 ** inPrice.decimals) *
                            inPrice.price
                          }
                        />
                        $
                      </div>
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
                        <div>
                          <InputNumber
                            decimals={2}
                            disabled
                            name="outPrice"
                            value={outPrice.price}
                          />
                          $
                        </div>
                      </div>
                      <div>
                        <InputLabel name="outValue">Value</InputLabel>
                        <div>
                          <InputNumber
                            decimals={2}
                            disabled
                            name="outValue"
                            value={
                              (quote.buyAmount / 10 ** outPrice.decimals) *
                              outPrice.price
                            }
                          />
                          $
                        </div>
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
              <div>
                <InputNumber
                  decimals={2}
                  disabled
                  name="impact"
                  value={quote.priceImpact * 100}
                />
                %
              </div>
            </div>
          </InputGroup>
        )}
      {accountInfo &&
        (hasOptedInApplication(accountInfo, validatorAppId) ? (
          buyAssetId === algoId || hasOptedInAsset(accountInfo, buyAssetId) ? (
            <Button
              disabled={!isAbleToSubmit}
              label="Swap"
              onClick={submitForm}
              type="submit"
            />
          ) : (
            <>
              <Button
                disabled={
                  algoBalance -
                    algoMinBalance -
                    config.params.MinTxnFee -
                    config.params.MinBalance <
                  0
                }
                label="Opt in"
                onClick={() => onOptInAsset(buyAssetId)}
                title={`Opt in to ${buyAsset?.params.name ?? "asset"}`}
              />
              <div style={{ color: "red" }}>
                Before swapping for an asset, you must opt in to it. This is a
                one-time action that will increase your minimum balance by{" "}
                {printDecimals(config.params.MinBalance, algoDecimals)}{" "}
                {config.native_asset.params.unitName}. You can opt out from the
                Asset list.
              </div>
            </>
          )
        ) : (
          <>
            <Button
              disabled={
                algoBalance -
                  algoMinBalance -
                  config.params.MinTxnFee -
                  config.params.AppFlatOptInMinBalance -
                  (config.params.SchemaMinBalancePerEntry +
                    config.params.SchemaUintMinBalance) *
                    16 <
                0
              }
              label="Opt in"
              onClick={onOptInApplication}
              title="Opt in to Tinyman application"
            />
            <div style={{ color: "red" }}>
              Before using the Swap functionality, you must opt in to the{" "}
              <Link href="https://tinyman.org">Tinyman</Link> smart contract.
              This is a one-time action that will increase your minimum balance
              by{" "}
              {printDecimals(
                config.params.AppFlatOptInMinBalance +
                  (config.params.SchemaMinBalancePerEntry +
                    config.params.SchemaUintMinBalance) *
                    16,
                algoDecimals
              )}{" "}
              {config.native_asset.params.unitName}. You can opt out from the
              Application list.
            </div>
          </>
        ))}
    </Form>
  )
}
