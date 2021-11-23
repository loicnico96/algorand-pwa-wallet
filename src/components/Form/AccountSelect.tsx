import { Address } from "lib/algo/Account"
import { Account } from "lib/db/schema"

export interface AccountSelectProps {
  accounts: Account[]
  allowManual?: boolean
  disabled?: boolean
  onChange: (address: Address) => unknown
  value: Address
}

const OPTION_VALUE_MANUAL = "manual"

export function AccountSelect({
  disabled = false,
  accounts,
  allowManual = false,
  onChange,
  value,
}: AccountSelectProps) {
  const selectedOption = accounts.some(account => account.address === value)
    ? value
    : allowManual
    ? OPTION_VALUE_MANUAL
    : undefined

  return (
    <>
      <select
        disabled={disabled}
        onChange={e => {
          if (e.target.value !== OPTION_VALUE_MANUAL) {
            onChange(e.target.value)
          } else {
            onChange("")
          }
        }}
        value={selectedOption}
      >
        {accounts.map(account => (
          <option
            key={account.address}
            label={
              account.name
                ? `${account.name} (${account.address})`
                : account.address
            }
            value={account.address}
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
