import algosdk from "algosdk"
import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useAccountData, useAddressBook } from "context/AddressBookContext"
import { encryptKey, PIN_REGEX } from "lib/utils/auth"

export interface ChoosePinProps {
  account: algosdk.Account
  onBack: () => unknown
  onNext: () => unknown
}

export function ChoosePin({ account, onBack, onNext }: ChoosePinProps) {
  const { addAccount, updateAccount } = useAddressBook()

  const data = useAccountData(account.addr)

  const [pin, setPin] = useState("")

  const onConfirm = useCallback(async () => {
    if (pin.match(PIN_REGEX)) {
      const key = encryptKey(account.sk, pin)
      if (data) {
        await updateAccount(account.addr, { key })
      } else {
        await addAccount(account.addr, { key })
      }
      onNext()
    }
  }, [account, addAccount, data, onNext, pin, updateAccount])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose your secret PIN (6 digits). It will be required to confirm
        transactions.
      </p>
      <input
        onChange={e => setPin(e.target.value)}
        type="password"
        value={pin}
      />
      <AsyncButton
        disabled={!pin.match(PIN_REGEX)}
        label="Confirm"
        onClick={onConfirm}
      />
    </div>
  )
}
