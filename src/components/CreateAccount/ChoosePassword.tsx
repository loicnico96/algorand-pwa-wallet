import algosdk from "algosdk"
import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useAddressBook } from "context/AddressBookContext"
import { useSecurityContext } from "context/SecurityContext"
import { AuthType } from "lib/storage/schema"
import { PASSWORD_REGEX } from "lib/utils/auth"

export interface ChoosePasswordProps {
  account: algosdk.Account
  onBack: () => unknown
  onNext: () => unknown
}

export function ChoosePassword({
  account,
  onBack,
  onNext,
}: ChoosePasswordProps) {
  const { updateAccount } = useAddressBook()
  const { addPrivateKey } = useSecurityContext()

  const [password, setPassword] = useState("")

  const onConfirm = useCallback(async () => {
    if (password.match(PASSWORD_REGEX)) {
      await addPrivateKey(account.addr, password, account.sk)
      await updateAccount(account.addr, { auth: AuthType.SINGLE })
      onNext()
    }
  }, [account, onNext, password, addPrivateKey, updateAccount])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose your secret pasword (6 digits). It will be required to confirm
        transactions.
      </p>
      <input
        onChange={e => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <AsyncButton
        disabled={!password.match(PASSWORD_REGEX)}
        label="Confirm"
        onClick={onConfirm}
      />
    </div>
  )
}
