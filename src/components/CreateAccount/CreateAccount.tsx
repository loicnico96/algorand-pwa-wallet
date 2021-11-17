import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"

import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

import { ChooseName } from "./ChooseName"
import { ChoosePin } from "./ChoosePin"
import { ConfirmAccount } from "./ConfirmAccount"
import { ConfirmPassphrase } from "./ConfirmPassphrase"
import { StorePassphrase } from "./StorePassphrase"

export enum CreateAccountStep {
  STORE_PASSPHRASE = 0,
  CONFIRM_PASSPHRASE = 1,
  CHOOSE_PIN = 2,
  CHOOSE_NAME = 3,
  CONFIRM_ACCOUNT = 4,
}

export function getPassphrase(account: algosdk.Account): string[] {
  return algosdk.secretKeyToMnemonic(account.sk).split(" ")
}

export function CreateAccount() {
  const router = useRouter()

  const [account] = useState(() => algosdk.generateAccount())
  const [step, setStep] = useState(CreateAccountStep.STORE_PASSPHRASE)

  const passphrase = useMemo(() => getPassphrase(account), [account])

  switch (step) {
    case CreateAccountStep.STORE_PASSPHRASE: {
      return (
        <StorePassphrase
          onBack={() => router.push(Route.ACCOUNT_LIST)}
          onNext={() => setStep(step + 1)}
          passphrase={passphrase}
        />
      )
    }

    case CreateAccountStep.CONFIRM_PASSPHRASE: {
      return (
        <ConfirmPassphrase
          onBack={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
          passphrase={passphrase}
        />
      )
    }

    case CreateAccountStep.CHOOSE_PIN: {
      return (
        <ChoosePin
          account={account}
          onBack={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
        />
      )
    }

    case CreateAccountStep.CHOOSE_NAME: {
      return (
        <ChooseName
          address={account.addr}
          onBack={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
        />
      )
    }

    case CreateAccountStep.CONFIRM_ACCOUNT: {
      const accountUrl = replaceParams(Route.ACCOUNT_VIEW, {
        [RouteParam.ADDRESS]: account.addr,
      })

      return (
        <ConfirmAccount
          address={account.addr}
          onBack={() => setStep(step - 1)}
          onNext={() => router.push(accountUrl)}
        />
      )
    }
  }
}
