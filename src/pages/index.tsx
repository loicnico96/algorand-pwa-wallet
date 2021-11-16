import { useRouter } from "next/router"
import { useEffect } from "react"

import { getAddress } from "lib/utils/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const address = getAddress()
    if (address) {
      router.push(`/account/${address}`).catch(error => {
        console.error(error)
      })
    }
  }, [router])

  return (
    <div>
      <button onClick={() => router.push("/account/create")}>
        Create account
      </button>
      <button onClick={() => router.push("/account/restore")}>
        Restore account
      </button>
    </div>
  )
}
