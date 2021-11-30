import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { toast } from "react-toastify"

import { Button } from "components/Primitives/Button"
import { useSecurityContext } from "context/SecurityContext"
import { useContact } from "hooks/storage/useContact"
import { AccountInfo } from "lib/algo/Account"
import { Route, RouteParam, withSearchParams } from "lib/utils/navigation"

export interface ViewOwnAccountActionsProps {
  account: AccountInfo
}

export function ViewOwnAccountActions({ account }: ViewOwnAccountActionsProps) {
  const router = useRouter()

  const { address } = account
  const { removeContact } = useContact(address)
  const { changePassword, getPrivateKey, removePrivateKey } =
    useSecurityContext()

  const onChangePassword = useCallback(async () => {
    await changePassword(address)
    toast.info("Your password has been changed.")
  }, [address, changePassword])

  const onShowPassphrase = useCallback(async () => {
    const key = await getPrivateKey(address)
    // eslint-disable-next-line no-alert
    window.alert(algosdk.secretKeyToMnemonic(key))
  }, [address, getPrivateKey])

  const onRemoveAccount = useCallback(async () => {
    // eslint-disable-next-line no-alert
    const confirmed = window.prompt("Are you sure? Type 'yes'.")
    if (confirmed === "yes") {
      await removeContact()
      await removePrivateKey(address)
      await router.replace(Route.ACCOUNTS_LIST)
    }
  }, [address, removeContact, removePrivateKey, router])

  const sendUrl = withSearchParams(Route.SEND, {
    [RouteParam.ADDRESS_FROM]: address,
  })

  const swapUrl = withSearchParams(Route.SWAP, {
    [RouteParam.ADDRESS]: address,
  })

  return (
    <div>
      <Button onClick={onChangePassword} label="Change password" />
      <Button onClick={onShowPassphrase} label="Show passphrase" />
      <Button onClick={onRemoveAccount} label="Remove account" />
      <Button href={sendUrl} label="Send" />
      <Button href={swapUrl} label="Swap" />
    </div>
  )
}
