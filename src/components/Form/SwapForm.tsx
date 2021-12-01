import algosdk from "algosdk"

import { Button } from "components/Primitives/Button"
import { useNetworkContext } from "context/NetworkContext"
import { useAccountAssetIds } from "hooks/api/useAccountAssetIds"
import { useAccountBalance } from "hooks/api/useAccountBalance"
import { getAccountInfo, useAccountInfo } from "hooks/api/useAccountInfo"
import { useAccountMinBalance } from "hooks/api/useAccountMinBalance"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrices } from "hooks/api/useAssetPrices"
import { usePoolInfo } from "hooks/api/usePoolInfo"
import { useTransactionParams } from "hooks/api/useTransactionParams"
import { useContacts } from "hooks/storage/useContacts"
import {
  createTinymanSwapTransaction,
  getPoolInfo,
  getSwapQuote,
  SwapMode,
} from "lib/algo/transactions/TinymanSwap"

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
export const ADDRESS_REGEX = new RegExp(`^[A-Z2-7]{${ADDRESS_LENGTH}}$`)
export const UINT_REGEX = /^[0-9]+$/
export const SWAP_FEE = 0.003

export function SwapForm() {
  const { config, indexer } = useNetworkContext()
  const { refetch: refetchParams } = useTransactionParams()
  const { data: prices } = useAssetPrices()

  const algoId = config.native_asset.index
  const algoDecimals = config.native_asset.params.decimals

  const { fieldProps, isSubmitting, isValid, setValue, submitForm, values } =
    useForm({
      fields: {
        address: {
          maxLength: ADDRESS_LENGTH,
          minLength: ADDRESS_LENGTH,
          pattern: ADDRESS_REGEX,
          required: true,
          type: "string",
        },
        amount: {
          min: 0,
          required: true,
          type: "number",
        },
        inAsset: {
          min: 0,
          required: true,
          type: "number",
        },
        mode: {
          pattern: /^fi|fo$/,
          required: true,
          type: "string",
        },
        outAsset: {
          min: 0,
          required: true,
          type: "number",
        },
        slippage: {
          max: 10,
          min: 0,
          required: true,
          type: "number",
        },
      },
      initialValues: {
        address: "",
        amount: 0,
        inAsset: algoId,
        mode: SwapMode.FIXED_INPUT,
        outAsset: algoId,
        slippage: 3,
      },
      onSubmit: async () => {
        const params = await refetchParams()
        const pool = prices?.[values.inAsset]?.pools[values.outAsset]

        if (!pool) {
          throw Error("Invalid state")
        }

        const account = await getAccountInfo(indexer, pool.address)
        const poolInfo = getPoolInfo(account, config)

        const quote = getSwapQuote({
          amount: values.amount,
          buyAssetId: values.outAsset,
          pool: poolInfo,
          sellAssetId: values.inAsset,
          swapMode: values.mode as SwapMode,
          slippage: values.slippage / 1000,
        })

        const transaction = createTinymanSwapTransaction(config, {
          inAmount: quote.sellAmountMax,
          inAssetId: quote.sellAssetId,
          mode: quote.swapMode,
          outAmount: quote.buyAmountMin,
          outAssetId: quote.buyAssetId,
          params,
          pool: pool.address,
          sender: values.address,
        })

        // eslint-disable-next-line no-console
        console.log(transaction)
      },
    })

  const isValidAddress = algosdk.isValidAddress(values.address)

  const inAssetId = values.inAsset
  const outAssetId = values.outAsset

  const { data: contacts } = useContacts()
  const { data: accountInfo } = useAccountInfo(values.address)
  const { data: inAsset } = useAssetInfo(inAssetId)
  const { data: outAsset } = useAssetInfo(outAssetId)

  const assetIds = useAccountAssetIds(accountInfo)

  const inBalance = useAccountBalance(accountInfo, inAssetId)
  const outBalance = useAccountBalance(accountInfo, outAssetId)

  const algoBalance = useAccountBalance(accountInfo, algoId)
  const algoMinBalance = useAccountMinBalance(accountInfo)
  const algoFee = config.params.MinTxnFee * 4

  const inPrice = prices?.[inAssetId]
  const outPrice = prices?.[outAssetId]

  const algoAvailable = Math.max(algoBalance - algoMinBalance - algoFee, 0)

  const swapMode = values.mode as SwapMode

  const { amount } = values

  const pools = inPrice?.pools ?? {}

  const { data: poolInfo } = usePoolInfo(pools[outAssetId]?.address ?? null)

  const maxSlippage = values.slippage / 1000

  const quote =
    poolInfo &&
    getSwapQuote({
      pool: poolInfo,
      sellAssetId: inAssetId,
      buyAssetId: outAssetId,
      amount,
      slippage: maxSlippage,
      swapMode,
    })

  const sellAmountAvailable = inAssetId === algoId ? algoAvailable : inBalance

  const maxQuote =
    poolInfo &&
    getSwapQuote({
      pool: poolInfo,
      sellAssetId: inAssetId,
      buyAssetId: outAssetId,
      amount: sellAmountAvailable,
      slippage: maxSlippage,
      swapMode: SwapMode.FIXED_INPUT,
    })

  const isAbleToPayFee = algoBalance - algoMinBalance >= algoFee

  const isAbleToSubmit =
    isValid &&
    isValidAddress &&
    isAbleToPayFee &&
    quote !== null &&
    quote.sellAmountMax > 0 &&
    quote.sellAmountMax <= sellAmountAvailable &&
    quote.sellAssetId !== quote.buyAssetId &&
    quote.buyAmountMin > 0 &&
    quote.buyAmountMin <= quote.buyReserves &&
    inAsset !== null &&
    outAsset !== null &&
    accountInfo !== null

  return (
    <Form onSubmit={submitForm}>
      <InputGroup group="address">
        <GroupLabel group="address">Address</GroupLabel>
        <InputLabel name="address">Address</InputLabel>
        <AccountSelect
          {...fieldProps.address}
          accounts={contacts}
          allowManual
          name="address"
          onlyOwnAccounts
        />
        {!values.address && (
          <div style={{ color: "red" }}>Please select an account.</div>
        )}
        {!!values.address && !isValidAddress && (
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
          <InputGroup group="in">
            <GroupLabel group="in">Exchange</GroupLabel>
            <div>
              <InputLabel name="inAsset">Asset</InputLabel>
              <AssetSelect
                {...fieldProps.inAsset}
                assets={assetIds.map(assetId => ({
                  assetId,
                  name: prices?.[assetId]?.name,
                }))}
                disabled={!isValidAddress}
                onChange={value => {
                  setValue("inAsset", value)
                  if (values.mode === SwapMode.FIXED_INPUT) {
                    setValue("amount", 0)
                  }
                }}
                value={values.inAsset}
              />
            </div>
            {sellAmountAvailable === 0 && (
              <div style={{ color: "red" }}>
                Please select a different asset.
              </div>
            )}
            {inAsset && quote && sellAmountAvailable > 0 && (
              <>
                <div>
                  <InputLabel name="inAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.amount}
                    decimals={inAsset.params.decimals}
                    max={sellAmountAvailable}
                    onChange={value => {
                      setValue("amount", value)
                      setValue("mode", SwapMode.FIXED_INPUT)
                    }}
                    unit={inAsset.params["unit-name"]}
                    value={quote.sellAmount}
                  />
                  <Button
                    label="Max"
                    onClick={() => {
                      setValue("amount", sellAmountAvailable)
                      setValue("mode", SwapMode.FIXED_INPUT)
                    }}
                    title="Set maximum amount"
                  />
                </div>
                {quote.sellAmountMax > sellAmountAvailable && (
                  <div style={{ color: "red" }}>
                    Not enough {inAsset.params["unit-name"]}.
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
                    decimals={inAsset.params.decimals}
                    disabled
                    name="inBalance"
                    unit={inAsset.params["unit-name"]}
                    value={inBalance}
                  />
                </div>
                {inAssetId === algoId && (
                  <div>
                    <InputLabel name="inAvailable">Available</InputLabel>
                    <AmountSelect
                      decimals={algoDecimals}
                      disabled
                      name="inAvailable"
                      unit={config.native_asset.params["unit-name"]}
                      value={algoAvailable}
                    />
                  </div>
                )}
              </>
            )}
          </InputGroup>
          <Button
            disabled={inAssetId === outAssetId}
            label="Swap assets"
            onClick={() => {
              setValue("inAsset", outAssetId)
              setValue("outAsset", inAssetId)
              setValue(
                "mode",
                swapMode === SwapMode.FIXED_INPUT
                  ? SwapMode.FIXED_OUTPUT
                  : SwapMode.FIXED_INPUT
              )
            }}
          />
          <InputGroup group="out">
            <GroupLabel group="out">For</GroupLabel>
            <div>
              <InputLabel name="outAsset">Asset</InputLabel>
              <AssetSelect
                {...fieldProps.outAsset}
                assets={Object.keys(pools)
                  .map(Number)
                  .filter(
                    assetId =>
                      assetIds.includes(assetId) ||
                      prices?.[assetId]?.is_verified
                  )
                  .map(assetId => ({
                    assetId,
                    name: prices?.[assetId]?.name,
                  }))}
                disabled={!isValidAddress}
                onChange={value => {
                  setValue("outAsset", value)
                  if (values.mode === SwapMode.FIXED_OUTPUT) {
                    setValue("amount", 0)
                  }
                }}
                value={values.outAsset}
              />
            </div>
            {outAssetId === inAssetId && (
              <div style={{ color: "red" }}>
                Please select a different asset.
              </div>
            )}
            {outAsset &&
              outAssetId !== inAssetId &&
              quote &&
              sellAmountAvailable > 0 && (
                <>
                  <div>
                    <InputLabel name="outAmount">Amount</InputLabel>
                    <AmountSelect
                      {...fieldProps.amount}
                      decimals={outAsset.params.decimals}
                      max={maxQuote?.buyAmount}
                      onChange={value => {
                        setValue("amount", value)
                        setValue("mode", SwapMode.FIXED_OUTPUT)
                      }}
                      unit={outAsset.params["unit-name"]}
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
                      decimals={outAsset.params.decimals}
                      disabled
                      name="outBalance"
                      unit={outAsset.params["unit-name"]}
                      value={outBalance}
                    />
                  </div>
                  {outAssetId === algoId && (
                    <div>
                      <InputLabel name="outAvailable">Available</InputLabel>
                      <AmountSelect
                        decimals={algoDecimals}
                        disabled
                        name="outAvailable"
                        unit={config.native_asset.params["unit-name"]}
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
        inAsset &&
        outAsset &&
        inAssetId !== outAssetId &&
        quote !== null &&
        quote.sellAmount > 0 && (
          <InputGroup group="advanced">
            <GroupLabel group="advanced">Advanced</GroupLabel>
            <div>
              <InputLabel name="mode">Swap Mode</InputLabel>
              <InputText {...fieldProps.mode} disabled />
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
                unit={config.native_asset.params["unit-name"]}
                value={algoFee}
              />
            </div>
            <div>
              <InputLabel name="feeSwap">
                Swap Fee ({quote.feeRate * 100}%)
              </InputLabel>
              <AmountSelect
                decimals={inAsset.params.decimals}
                disabled
                name="feeSwap"
                unit={inAsset.params["unit-name"]}
                value={quote.feeAmount}
              />
            </div>
            {swapMode === SwapMode.FIXED_INPUT && (
              <div>
                <InputLabel name="outAmountFinal">Minimum received</InputLabel>
                <AmountSelect
                  decimals={outAsset.params.decimals}
                  disabled
                  name="outAmountFinal"
                  unit={outAsset.params["unit-name"]}
                  value={quote.buyAmountMin}
                />
              </div>
            )}
            {swapMode === SwapMode.FIXED_OUTPUT && (
              <div>
                <InputLabel name="inAmountFinal">Maximum sent</InputLabel>
                <AmountSelect
                  decimals={inAsset.params.decimals}
                  disabled
                  name="inAmountFinal"
                  unit={inAsset.params["unit-name"]}
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
    </Form>
  )
}
