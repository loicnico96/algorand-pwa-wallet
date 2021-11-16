import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"

import ViewAccount from "components/ViewAccount"
import {
  changePIN,
  getAddress,
  withSecretKey,
  removeAccount,
} from "lib/utils/auth"

export default function ViewAccountPage() {
  const router = useRouter()

  const { isReady, query } = router

  const address = Array.isArray(query.addr) ? query.addr[0] : query.addr

  useEffect(() => {
    if (isReady && !address) {
      router.replace("/").catch(error => {
        console.error(error)
      })
    }
  }, [address, isReady, router])

  const onShowPassphrase = useCallback(() => {
    withSecretKey(key => {
      // eslint-disable-next-line no-alert
      window.alert(algosdk.secretKeyToMnemonic(key))
    })
  }, [])

  const onRemoveAccount = useCallback(() => {
    if (removeAccount()) {
      router.replace("/").catch(error => {
        console.error(error)
      })
    }
  }, [router])

  if (!address) {
    return <pre>Loading...</pre>
  }

  return (
    <div>
      <Link href="/">Back</Link>
      <ViewAccount address={address} />
      {address === getAddress() && (
        <button onClick={changePIN}>Change PIN</button>
      )}
      {address === getAddress() && (
        <button onClick={onShowPassphrase}>Show passphrase</button>
      )}
      {address === getAddress() && (
        <button onClick={onRemoveAccount}>Remove account</button>
      )}
    </div>
  )
}
