import { useMemo } from "react"

import { ContactData, getContactName } from "lib/storage/contacts"

export interface AccountSelectProps {
  accounts: Record<string, ContactData>
  allowManual?: boolean
  disabled?: boolean
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
  name,
  onChange,
  onlyOwnAccounts = false,
  value,
}: AccountSelectProps) {
  const selectedOption = accounts[value]
    ? value
    : allowManual
    ? OPTION_VALUE_MANUAL
    : undefined

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
      <select
        disabled={disabled}
        id={`input-${name}`}
        name={name}
        onChange={e => {
          if (e.target.value !== OPTION_VALUE_MANUAL) {
            onChange(e.target.value)
          } else {
            onChange("")
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
      </select>
      {allowManual && selectedOption === OPTION_VALUE_MANUAL && (
        <input
          onChange={e => onChange(e.target.value)}
          placeholder="Select address"
          type="text"
          value={value}
        />
      )}
    </>
  )
}
