import { AccountData } from "lib/storage/schema"

export interface AccountSelectProps {
  accounts: Record<string, AccountData>
  allowManual?: boolean
  disabled?: boolean
  onChange: (address: string) => unknown
  onlyOwnAccounts?: boolean
  value: string
}

const OPTION_VALUE_MANUAL = "manual"

export function AccountSelect({
  disabled = false,
  accounts,
  allowManual = false,
  onChange,
  onlyOwnAccounts = false,
  value,
}: AccountSelectProps) {
  const selectedOption = accounts[value]
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
        {Object.keys(accounts).map(address => {
          const account = accounts[address]

          if (onlyOwnAccounts && !account.auth) {
            return null
          }

          return (
            <option
              key={address}
              label={account.name ? `${account.name} (${address})` : address}
              value={address}
            />
          )
        })}
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
