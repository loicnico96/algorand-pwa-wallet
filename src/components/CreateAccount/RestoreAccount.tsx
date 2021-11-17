import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useState } from "react"

import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

import { ChooseName } from "./ChooseName"
import { ChoosePin } from "./ChoosePin"
import { RestorePassphrase } from "./RestorePassphrase"

export enum RestoreAccountStep {
  RESTORE_PASSPHRASE = 0,
  CHOOSE_PIN = 1,
  CHOOSE_NAME = 2,
}

export function getPassphrase(account: algosdk.Account): string[] {
  return algosdk.secretKeyToMnemonic(account.sk).split(" ")
}

export function RestoreAccount() {
  const router = useRouter()

  const [account, setAccount] = useState<algosdk.Account | null>(null)
  const [step, setStep] = useState(RestoreAccountStep.RESTORE_PASSPHRASE)

  switch (step) {
    case RestoreAccountStep.RESTORE_PASSPHRASE: {
      return (
        <RestorePassphrase
          onBack={() => router.push(Route.ACCOUNT_LIST)}
          onNext={passphrase => {
            setAccount(algosdk.mnemonicToSecretKey(passphrase.join(" ")))
            setStep(step + 1)
          }}
        />
      )
    }

    case RestoreAccountStep.CHOOSE_PIN: {
      if (!account) {
        throw Error("Invalid state")
      }

      return (
        <ChoosePin
          account={account}
          onBack={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
        />
      )
    }

    case RestoreAccountStep.CHOOSE_NAME: {
      if (!account) {
        throw Error("Invalid state")
      }

      const accountUrl = replaceParams(Route.ACCOUNT_VIEW, {
        [RouteParam.ADDRESS]: account.addr,
      })

      return (
        <ChooseName
          address={account.addr}
          onBack={() => setStep(step - 1)}
          onNext={() => router.push(accountUrl)}
        />
      )
    }
  }
}
