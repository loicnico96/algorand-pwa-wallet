import algosdk from "algosdk"

import { Button } from "components/Primitives/Button"
import { useNetworkContext } from "context/NetworkContext"
import { useAccountAssetIds } from "hooks/api/useAccountAssetIds"
import { useAccountBalance } from "hooks/api/useAccountBalance"
import { useAccountInfo } from "hooks/api/useAccountInfo"
import { useAccountMinBalance } from "hooks/api/useAccountMinBalance"
import { useAssetInfo } from "hooks/api/useAssetInfo"
import { useAssetPrices } from "hooks/api/useAssetPrices"
import { useContacts } from "hooks/storage/useContacts"
import { defaultLogger } from "lib/utils/logger"

import { AccountSelect } from "./AccountSelect"
import { AmountSelect } from "./AmountSelect"
import { AssetSelect } from "./AssetSelect"
import { Form } from "./Primitives/Form"
import { FormSubmit } from "./Primitives/FormSubmit"
import { GroupLabel } from "./Primitives/GroupLabel"
import { InputBase } from "./Primitives/InputBase"
import { InputGroup } from "./Primitives/InputGroup"
import { InputLabel } from "./Primitives/InputLabel"
import { useForm } from "./Primitives/useForm"

export enum SwapMode {
  FIXED_INPUT = "fi",
  FIXED_OUTPUT = "fo",
}

export const ADDRESS_LENGTH = 58
export const ADDRESS_REGEX = new RegExp(`^[A-Z2-7]{${ADDRESS_LENGTH}}$`)
export const UINT_REGEX = /^[0-9]+$/
export const SWAP_FEE = 0.003

export function SwapForm() {
  const { config } = useNetworkContext()

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
          type: "text",
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
          type: "text",
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
        amount: String(0),
        inAsset: String(algoId),
        mode: SwapMode.FIXED_INPUT,
        outAsset: String(algoId),
        slippage: String(3),
      },
      onSubmit: async () => {
        defaultLogger.warn("Not implemented", values)
      },
    })

  const isValidAddress = algosdk.isValidAddress(values.address)

  const inAssetId = parseInt(values.inAsset, 10)
  const outAssetId = parseInt(values.outAsset, 10)

  const { data: contacts } = useContacts()
  const { data: accountInfo } = useAccountInfo(values.address)
  const { data: inAsset } = useAssetInfo(inAssetId)
  const { data: outAsset } = useAssetInfo(outAssetId)

  const { data: prices } = useAssetPrices()

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

  const amount = Number.parseInt(values.amount, 10)

  const pools = inPrice?.pools ?? {}
  const poolInfo = pools[outAssetId]

  const inReserves = poolInfo
    ? poolInfo.asset1.id === inAssetId
      ? poolInfo.asset1.reserves
      : poolInfo.asset2.reserves
    : undefined

  const outReserves = poolInfo
    ? poolInfo.asset1.id === inAssetId
      ? poolInfo.asset2.reserves
      : poolInfo.asset1.reserves
    : undefined

  const inAmount =
    swapMode === SwapMode.FIXED_OUTPUT
      ? inReserves && outReserves
        ? (inReserves * amount) / (outReserves - amount) / (1 - SWAP_FEE)
        : 0
      : amount

  const outAmount =
    swapMode === SwapMode.FIXED_OUTPUT
      ? amount
      : inReserves && outReserves
      ? ((outReserves * amount) / (inReserves + amount)) * (1 - SWAP_FEE)
      : 0

  const inAmountMax = inAssetId === algoId ? algoAvailable : inBalance

  const maxSlippage = Number.parseInt(values.slippage, 10) / 1000

  const outAmountMax =
    inReserves && outReserves
      ? ((outReserves * inAmountMax) / (inReserves + inAmountMax)) *
        (1 - SWAP_FEE) *
        (1 - maxSlippage)
      : 0

  const currentRate =
    inReserves && outReserves ? inReserves / outReserves : undefined

  const actualRate = (inAmount / outAmount) * (1 - SWAP_FEE)

  const priceImpact = currentRate ? actualRate / currentRate - 1 : undefined

  const isAbleToPayFee = algoBalance - algoMinBalance >= algoFee

  const isAbleToSend =
    swapMode === SwapMode.FIXED_OUTPUT
      ? inAmount / (1 - maxSlippage) <= inAmountMax
      : inAmount <= inAmountMax

  const isAbleToSubmit =
    isValid &&
    isValidAddress &&
    isAbleToPayFee &&
    isAbleToSend &&
    amount > 0 &&
    inAssetId !== outAssetId &&
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
                  setValue("inAsset", String(value))
                  if (values.mode === SwapMode.FIXED_INPUT) {
                    setValue("amount", String(0))
                  }
                }}
                value={parseInt(values.inAsset, 10)}
              />
            </div>
            {inAmountMax === 0 && (
              <div style={{ color: "red" }}>
                Please select a different asset.
              </div>
            )}
            {!!inAsset && inAmountMax > 0 && (
              <>
                <div>
                  <InputLabel name="inAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.amount}
                    decimals={inAsset.params.decimals}
                    disabled={!isValidAddress || !inAsset}
                    max={inAmountMax}
                    onChange={value => {
                      setValue("amount", String(value))
                      setValue("mode", SwapMode.FIXED_INPUT)
                    }}
                    unit={inAsset.params["unit-name"]}
                    value={inAmount}
                  />
                </div>
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
                          (inAmount / 10 ** (inPrice.decimals - 2)) *
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
              setValue("inAsset", String(outAssetId))
              setValue("outAsset", String(inAssetId))
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
                  setValue("outAsset", String(value))
                  if (values.mode === SwapMode.FIXED_OUTPUT) {
                    setValue("amount", String(0))
                  }
                }}
                value={parseInt(values.outAsset, 10)}
              />
            </div>
            {outAssetId === inAssetId && (
              <div style={{ color: "red" }}>
                Please select a different asset.
              </div>
            )}
            {!!outAsset && outAssetId !== inAssetId && inBalance > 0 && (
              <>
                <div>
                  <InputLabel name="outAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.amount}
                    disabled={!isValidAddress || !outAsset}
                    decimals={outAsset.params.decimals}
                    max={outAmountMax}
                    onChange={value => {
                      setValue("amount", String(value))
                      setValue("mode", SwapMode.FIXED_OUTPUT)
                    }}
                    unit={outAsset.params["unit-name"]}
                    value={outAmount}
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
                          (outAmount / 10 ** (outPrice.decimals - 2)) *
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
        inAmount > 0 && (
          <InputGroup group="advanced">
            <GroupLabel group="advanced">Advanced</GroupLabel>
            <div>
              <InputLabel name="mode">Swap Mode</InputLabel>
              <InputBase {...fieldProps.mode} disabled />
            </div>
            <div>
              <InputLabel name="slippage">Slippage Tolerance</InputLabel>
              <AmountSelect
                {...fieldProps.slippage}
                decimals={1}
                disabled={!isValidAddress}
                onChange={value => setValue("slippage", String(value))}
                unit="%"
                value={parseInt(values.slippage, 10)}
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
                Swap Fee ({SWAP_FEE * 100}%)
              </InputLabel>
              <AmountSelect
                decimals={inAsset.params.decimals}
                disabled
                name="feeSwap"
                unit={inAsset.params["unit-name"]}
                value={inAmount * SWAP_FEE}
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
                  value={outAmount * (1 - maxSlippage)}
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
                  value={inAmount / (1 - maxSlippage)}
                />
              </div>
            )}
            {!isAbleToSend && (
              <div style={{ color: "red" }}>
                Not enough {inAsset.params["unit-name"]}.
              </div>
            )}
            {priceImpact !== undefined && (
              <div>
                <InputLabel name="impact">Price Impact</InputLabel>
                <AmountSelect
                  decimals={2}
                  disabled
                  name="impact"
                  unit="%"
                  value={priceImpact * 10000}
                />
              </div>
            )}
          </InputGroup>
        )}
      <FormSubmit disabled={isSubmitting || !isAbleToSubmit} label="Swap" />
    </Form>
  )
}
