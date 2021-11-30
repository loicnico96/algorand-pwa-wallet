import { useMemo } from "react"

import { ContactData, getContactName } from "lib/storage/contacts"

import { InputBase } from "./Primitives/InputBase"
import { InputSelect } from "./Primitives/InputSelect"

export interface AccountSelectProps {
  accounts: Record<string, ContactData>
  allowManual?: boolean
  disabled?: boolean
  label?: string
  name: string
  onChange: (address: string) => unknown
  onlyOwnAccounts?: boolean
  value: string
}

const OPTION_VALUE_MANUAL = "manual"

export function AccountSelect({
  disabled = false,
  accounts,
  allowManual = false,
  label,
  name,
  onChange,
  onlyOwnAccounts = false,
  value,
}: AccountSelectProps) {
  const selectedOption = accounts[value]
    ? value
    : allowManual
    ? OPTION_VALUE_MANUAL
    : ""

  const sortedAddresses = useMemo(
    () =>
      Object.keys(accounts)
        .filter(address => !onlyOwnAccounts || accounts[address].auth)
        .sort((addressA, addressB) => {
          const nameA = getContactName(addressA, accounts[addressA])
          const nameB = getContactName(addressB, accounts[addressB])
          return nameA.localeCompare(nameB)
        }),
    [accounts, onlyOwnAccounts]
  )

  return (
    <>
      <InputSelect
        disabled={disabled}
        label={label}
        name={name}
        onChange={newValue => {
          if (newValue === OPTION_VALUE_MANUAL) {
            onChange("")
          } else {
            onChange(newValue)
          }
        }}
        value={selectedOption}
      >
        {sortedAddresses.map(address => (
          <option
            key={address}
            label={getContactName(address, accounts[address])}
            value={address}
          />
        ))}
        {allowManual && <option label="Other..." value={OPTION_VALUE_MANUAL} />}
      </InputSelect>
      {allowManual && selectedOption === OPTION_VALUE_MANUAL && (
        <InputBase
          label={label}
          name={`${name}-manual`}
          onChange={onChange}
          placeholder="Select address"
          value={value}
        />
      )}
    </>
  )
}
