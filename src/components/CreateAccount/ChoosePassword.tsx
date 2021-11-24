import algosdk from "algosdk"
import { useCallback, useState } from "react"

import { AsyncButton } from "components/AsyncButton"
import { useSecurityContext } from "context/SecurityContext"
import { useContact } from "hooks/storage/useContact"
import { AuthType } from "lib/storage/contacts"
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
  const { updateContact } = useContact(account.addr)
  const { addPrivateKey } = useSecurityContext()

  const [password, setPassword] = useState("")

  const onConfirm = useCallback(async () => {
    if (password.match(PASSWORD_REGEX)) {
      await addPrivateKey(account.addr, password, account.sk)
      await updateContact({ auth: AuthType.SINGLE })
      onNext()
    }
  }, [account, onNext, password, addPrivateKey, updateContact])

  return (
    <div>
      <a onClick={onBack}>Back</a>
      <p>
        Choose your secret pasword (6 digits). It will be required to confirm
        transactions.
      </p>
      <input
        autoFocus
        id="input-password"
        onChange={e => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <AsyncButton
        id="submit"
        disabled={!password.match(PASSWORD_REGEX)}
        label="Confirm"
        onClick={onConfirm}
      />
    </div>
  )
}
