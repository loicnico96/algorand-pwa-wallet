import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"

import { addAccount } from "lib/utils/auth"

export default function CreateAccountPage() {
  const account = useMemo(() => algosdk.generateAccount(), [])
  const passphrase = useMemo(
    () => algosdk.secretKeyToMnemonic(account.sk).split(" "),
    [account]
  )

  const router = useRouter()

  const onConfirm = useCallback(() => {
    if (addAccount(account)) {
      router.replace(`/account/${account.addr}`).catch(error => {
        console.error(error)
      })
    }
  }, [account, router])

  return (
    <div>
      <Link href="/">Back</Link>
      {passphrase.map((value, index) => (
        <div key={index}>
          <pre>
            {index}: {value}
          </pre>
        </div>
      ))}
      <button onClick={onConfirm}>Confirm</button>
    </div>
  )
}
