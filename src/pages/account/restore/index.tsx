import algosdk from "algosdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"

import { addAccount } from "lib/utils/auth"

export const PASSPHRASE_LENGTH = 25

export default function RestoreAccountPage() {
  const router = useRouter()

  const [passphrase, setPassphrase] = useState<string[]>(
    Array(PASSPHRASE_LENGTH).fill("")
  )

  const setWord = useCallback((index: number, value: string) => {
    setPassphrase(phrase => phrase.map((v, i) => (i === index ? value : v)))
  }, [])

  const onConfirm = useCallback(() => {
    const account = algosdk.mnemonicToSecretKey(passphrase.join(" "))
    if (addAccount(account)) {
      router.replace(`/account/${account.addr}`).catch(error => {
        console.error(error)
      })
    }
  }, [passphrase, router])

  return (
    <div>
      <Link href="/">Back</Link>
      {passphrase.map((value, index) => (
        <div key={index}>
          <pre>{index}:</pre>
          <input onChange={e => setWord(index, e.target.value)} value={value} />
        </div>
      ))}
      <button disabled={!passphrase.every(Boolean)} onClick={onConfirm}>
        Confirm
      </button>
    </div>
  )
}
