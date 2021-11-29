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
import { InputGroup } from "./Primitives/InputGroup"
import { InputLabel } from "./Primitives/InputLabel"
import { InputText } from "./Primitives/InputText"
import { useForm } from "./Primitives/useForm"

export enum SwapMode {
  FIXED_INPUT = "fi",
  FIXED_OUTPUT = "fo",
}

export const ADDRESS_LENGTH = 58
export const ADDRESS_REGEX = new RegExp(`^[A-Z2-7]{${ADDRESS_LENGTH}}$`)
export const UINT_REGEX = /[0-9]+/
export const SWAP_FEE = 0.003

export function SwapForm() {
  const { config } = useNetworkContext()

  const algoId = config.native_asset.index
  const algoDecimals = config.native_asset.params.decimals

  const { fieldProps, isSubmitting, isValid, submitForm } = useForm({
    fields: {
      address: {
        maxLength: ADDRESS_LENGTH,
        minLength: ADDRESS_LENGTH,
        pattern: ADDRESS_REGEX,
        required: true,
      },
      amount: {
        pattern: UINT_REGEX,
        required: true,
      },
      inAsset: {
        pattern: UINT_REGEX,
        required: true,
      },
      mode: {
        pattern: /^fi|fo$/,
        required: true,
      },
      outAsset: {
        pattern: UINT_REGEX,
        required: true,
      },
      slippage: {
        pattern: UINT_REGEX,
        required: true,
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
    onSubmit: async values => {
      defaultLogger.warn("Not implemented", values)
    },
  })

  const isValidAddress = algosdk.isValidAddress(fieldProps.address.value)

  const inAssetId = parseInt(fieldProps.inAsset.value, 10)
  const outAssetId = parseInt(fieldProps.outAsset.value, 10)

  const { data: contacts } = useContacts()
  const { data: accountInfo } = useAccountInfo(fieldProps.address.value)
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

  const swapMode = fieldProps.mode.value as SwapMode

  const amount = parseInt(fieldProps.amount.value, 10)

  const inAmount =
    swapMode === SwapMode.FIXED_OUTPUT
      ? outPrice?.decimals !== undefined && inPrice?.decimals !== undefined
        ? amount *
          (outPrice.price / inPrice.price) *
          (10 ** (outPrice.decimals - inPrice.decimals) / (1 - SWAP_FEE))
        : 0
      : amount

  const outAmount =
    swapMode === SwapMode.FIXED_OUTPUT
      ? amount
      : outPrice?.decimals !== undefined && inPrice?.decimals !== undefined
      ? amount *
        (inPrice.price / outPrice.price) *
        (10 ** (inPrice.decimals - outPrice.decimals) * (1 - SWAP_FEE))
      : 0

  const inAmountMax = inAssetId === algoId ? algoAvailable : inBalance

  const outAmountMax =
    outPrice?.decimals !== undefined && inPrice?.decimals !== undefined
      ? inAmountMax *
        (inPrice.price / outPrice.price) *
        (10 ** (inPrice.decimals - outPrice.decimals) * (1 - SWAP_FEE))
      : 0

  const isAbleToPayFee = algoBalance - algoMinBalance >= algoFee

  const isAbleToSubmit =
    isValid &&
    isValidAddress &&
    isAbleToPayFee &&
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
        {!fieldProps.address.value && (
          <div style={{ color: "red" }}>Please select an account.</div>
        )}
        {!!fieldProps.address.value && !isValidAddress && (
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
                assetIds={assetIds}
                disabled={!isValidAddress}
                onChange={value => {
                  fieldProps.inAsset.onChange(String(value))
                  if (fieldProps.mode.value === SwapMode.FIXED_INPUT) {
                    fieldProps.amount.onChange(String(0))
                  }
                }}
                value={parseInt(fieldProps.inAsset.value, 10)}
              />
            </div>
            {!!inAsset && (
              <>
                <div>
                  <InputLabel name="inAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.amount}
                    decimals={inAsset.params.decimals}
                    disabled={!isValidAddress || !inAsset}
                    max={inAmountMax}
                    onChange={value => {
                      fieldProps.amount.onChange(String(value))
                      fieldProps.mode.onChange(SwapMode.FIXED_INPUT)
                    }}
                    unit={inAsset.params["unit-name"]}
                    value={inAmount}
                  />
                </div>
                <div>
                  <InputLabel name="inPrice">Price</InputLabel>
                  <AmountSelect
                    decimals={2}
                    disabled
                    name="inPrice"
                    unit="$"
                    value={(inPrice?.price ?? 0) * 10 ** 2}
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
                      inPrice?.decimals
                        ? (inAmount / 10 ** (inPrice.decimals - 2)) *
                          inPrice.price
                        : 0
                    }
                  />
                </div>
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
              fieldProps.inAsset.onChange(String(outAssetId))
              fieldProps.outAsset.onChange(String(inAssetId))
              fieldProps.mode.onChange(
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
                assetIds={assetIds}
                disabled={!isValidAddress}
                onChange={value => {
                  fieldProps.outAsset.onChange(String(value))
                  if (fieldProps.mode.value === SwapMode.FIXED_OUTPUT) {
                    fieldProps.amount.onChange(String(0))
                  }
                }}
                value={parseInt(fieldProps.outAsset.value, 10)}
              />
            </div>
            {outAssetId === inAssetId && (
              <div style={{ color: "red" }}>
                Please select a different asset.
              </div>
            )}
            {!!outAsset && outAssetId !== inAssetId && (
              <>
                <div>
                  <InputLabel name="outAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.amount}
                    disabled={!isValidAddress || !outAsset}
                    decimals={outAsset.params.decimals}
                    max={outAmountMax}
                    onChange={value => {
                      fieldProps.amount.onChange(String(value))
                      fieldProps.mode.onChange(SwapMode.FIXED_OUTPUT)
                    }}
                    unit={outAsset.params["unit-name"]}
                    value={outAmount}
                  />
                </div>
                <div>
                  <InputLabel name="outPrice">Price</InputLabel>
                  <AmountSelect
                    decimals={2}
                    disabled
                    name="outPrice"
                    unit="$"
                    value={(outPrice?.price ?? 0) * 10 ** 2}
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
                      outPrice?.decimals
                        ? (outAmount / 10 ** (outPrice.decimals - 2)) *
                          outPrice.price
                        : 0
                    }
                  />
                </div>
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
                max={10}
                onChange={value => fieldProps.slippage.onChange(String(value))}
                unit="%"
                value={parseInt(fieldProps.slippage.value, 10)}
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
                decimals={inAsset?.params.decimals ?? algoDecimals}
                disabled
                name="feeSwap"
                unit={inAsset?.params["unit-name"]}
                value={inAmount * SWAP_FEE}
              />
            </div>
          </InputGroup>
        </>
      )}
      <FormSubmit disabled={isSubmitting || !isAbleToSubmit} label="Swap" />
    </Form>
  )
}
