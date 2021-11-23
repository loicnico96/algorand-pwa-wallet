import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { toast } from "react-toastify"

import { AsyncButton } from "components/AsyncButton"
import { useAddressBook } from "context/AddressBookContext"
import { useSecurityContext } from "context/SecurityContext"
import { AccountInfo } from "lib/algo/Account"
import { Route, RouteParam, withSearchParams } from "lib/utils/navigation"

export interface ViewOwnAccountActionsProps {
  account: AccountInfo
}

export function ViewOwnAccountActions({ account }: ViewOwnAccountActionsProps) {
  const router = useRouter()

  const { address } = account

  const { removeAccount } = useAddressBook()
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
      await removeAccount(address)
      await removePrivateKey(address)
      await router.replace(Route.ACCOUNTS_LIST)
    }
  }, [address, removeAccount, removePrivateKey, router])

  const sendUrl = withSearchParams(Route.SEND, {
    [RouteParam.ADDRESS_FROM]: address,
  })

  return (
    <div>
      <AsyncButton onClick={onChangePassword} label="Change password" />
      <AsyncButton onClick={onShowPassphrase} label="Show passphrase" />
      <AsyncButton onClick={onRemoveAccount} label="Remove account" />
      <Link href={sendUrl}>
        <a>
          <button>Send</button>
        </a>
      </Link>
    </div>
  )
}
