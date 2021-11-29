import algosdk from "algosdk"

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
      inAmount: {
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
      outAmount: {
        pattern: UINT_REGEX,
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
      inAmount: String(0),
      inAsset: String(algoId),
      mode: SwapMode.FIXED_INPUT,
      outAmount: String(0),
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

  const algoMinBalance = useAccountMinBalance(accountInfo)
  const algoFee = config.params.MinTxnFee * 4

  const inPrice = prices?.[inAssetId]
  const outPrice = prices?.[outAssetId]

  const inAvailable =
    inAssetId === algoId
      ? Math.max(inBalance - algoMinBalance - algoFee, 0)
      : inBalance

  const outAvailable =
    inPrice && outPrice ? inAvailable / (outPrice.price / inPrice.price) : 0

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
      </InputGroup>
      {isValidAddress && (
        <>
          <InputGroup group="in">
            <GroupLabel group="in">Exchange</GroupLabel>
            <div>
              <InputLabel name="inAsset">Asset</InputLabel>
              <AssetSelect
                {...fieldProps.inAsset}
                assetIds={assetIds}
                disabled={!isValidAddress}
                onChange={value => fieldProps.inAsset.onChange(String(value))}
                value={parseInt(fieldProps.inAsset.value, 10)}
              />
            </div>
            {!!inAsset && (
              <>
                <div>
                  <InputLabel name="inAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.inAmount}
                    decimals={inAsset.params.decimals}
                    disabled={!isValidAddress || !inAsset}
                    max={inAvailable}
                    onChange={value =>
                      fieldProps.inAmount.onChange(String(value))
                    }
                    unit={inAsset.params["unit-name"]}
                    value={parseInt(fieldProps.inAmount.value, 10)}
                  />
                </div>
                <div>
                  <InputLabel name="inPrice">Price</InputLabel>
                  <AmountSelect
                    decimals={2}
                    disabled
                    name="inPrice"
                    unit="$"
                    value={inPrice?.price ?? 0}
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
                        ? (parseInt(fieldProps.inAmount.value, 10) /
                            10 ** inPrice.decimals) *
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
                      decimals={inAsset.params.decimals}
                      disabled
                      name="inAvailable"
                      unit={inAsset.params["unit-name"]}
                      value={inAvailable}
                    />
                  </div>
                )}
              </>
            )}
          </InputGroup>
          <InputGroup group="out">
            <GroupLabel group="out">For</GroupLabel>
            <div>
              <InputLabel name="outAsset">Asset</InputLabel>
              <AssetSelect
                {...fieldProps.outAsset}
                assetIds={assetIds}
                disabled={!isValidAddress}
                onChange={value => fieldProps.outAsset.onChange(String(value))}
                value={parseInt(fieldProps.outAsset.value, 10)}
              />
            </div>
            {!!outAsset && (
              <>
                <div>
                  <InputLabel name="outAmount">Amount</InputLabel>
                  <AmountSelect
                    {...fieldProps.outAmount}
                    disabled={!isValidAddress || !outAsset}
                    decimals={outAsset.params.decimals}
                    max={outAvailable}
                    onChange={value =>
                      fieldProps.outAmount.onChange(String(value))
                    }
                    unit={outAsset.params["unit-name"]}
                    value={parseInt(fieldProps.outAmount.value, 10)}
                  />
                </div>
                <div>
                  <InputLabel name="outPrice">Price</InputLabel>
                  <AmountSelect
                    decimals={2}
                    disabled
                    name="outPrice"
                    unit="$"
                    value={outPrice?.price ?? 0}
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
                        ? (parseInt(fieldProps.outAmount.value, 10) /
                            10 ** outPrice.decimals) *
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
              <InputLabel name="feeSwap">Swap Fee (0.3%)</InputLabel>
              <AmountSelect
                decimals={inAsset?.params.decimals ?? algoDecimals}
                disabled
                name="feeSwap"
                unit={inAsset?.params["unit-name"]}
                value={parseInt(fieldProps.inAmount.value, 10) * 0.003}
              />
            </div>
          </InputGroup>
        </>
      )}
      <FormSubmit disabled={isSubmitting || !isValid} label="Swap" />
    </Form>
  )
}
