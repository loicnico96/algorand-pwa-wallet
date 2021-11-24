import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useState } from "react"

import { useSteps } from "hooks/navigation/useSteps"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

import { ChooseName } from "./ChooseName"
import { ChoosePassword } from "./ChoosePassword"
import { RestoreAccount } from "./RestoreAccount"
import { RestorePassphrase } from "./RestorePassphrase"

export enum RestoreAccountStep {
  RESTORE_ACCOUNT = "",
  RESTORE_PASSPHRASE = "passphrase",
  CHOOSE_PASSWORD = "password",
  CHOOSE_NAME = "details",
}

export function RestoreAccountPages() {
  const [account, setAccount] = useState<algosdk.Account>()

  const router = useRouter()

  const { onBack, onNext, step } = useSteps({
    onFirstStepBack: () => router.push(Route.ACCOUNTS_LIST),
    onLastStepNext: async () => {
      if (account) {
        const accountUrl = replaceParams(Route.ACCOUNTS_VIEW, {
          [RouteParam.ADDRESS]: account.addr,
        })

        await router.push(accountUrl)
      }
    },
    steps: [
      RestoreAccountStep.RESTORE_ACCOUNT,
      RestoreAccountStep.RESTORE_PASSPHRASE,
      RestoreAccountStep.CHOOSE_PASSWORD,
      RestoreAccountStep.CHOOSE_NAME,
    ],
  })

  switch (step) {
    case RestoreAccountStep.RESTORE_ACCOUNT:
      return <RestoreAccount onBack={onBack} onNext={onNext} />

    case RestoreAccountStep.RESTORE_PASSPHRASE:
      return (
        <RestorePassphrase
          onBack={onBack}
          onNext={passphrase => {
            setAccount(algosdk.mnemonicToSecretKey(passphrase.join(" ")))
            return onNext()
          }}
        />
      )

    case RestoreAccountStep.CHOOSE_PASSWORD:
      if (!account) {
        throw Error("Invalid state")
      }

      return (
        <ChoosePassword account={account} onBack={onBack} onNext={onNext} />
      )

    case RestoreAccountStep.CHOOSE_NAME:
      if (!account) {
        throw Error("Invalid state")
      }

      return (
        <ChooseName address={account.addr} onBack={onBack} onNext={onNext} />
      )
  }
}
