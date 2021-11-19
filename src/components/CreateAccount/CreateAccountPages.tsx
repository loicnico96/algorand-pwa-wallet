import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"

import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

import { ChooseName } from "./ChooseName"
import { ChoosePin } from "./ChoosePin"
import { ConfirmAccount } from "./ConfirmAccount"
import { ConfirmPassphrase } from "./ConfirmPassphrase"
import { CreateAccount } from "./CreateAccount"
import { StorePassphrase } from "./StorePassphrase"
import { useSteps } from "./useSteps"

export enum CreateAccountStep {
  CREATE_ACCOUNT = "",
  STORE_PASSPHRASE = "passphrase",
  CONFIRM_PASSPHRASE = "confirm-passphrase",
  CHOOSE_PIN = "choose-pin",
  CHOOSE_NAME = "choose-name",
  CONFIRM_ACCOUNT = "last-steps",
}

export function CreateAccountPages() {
  const [account] = useState(() => algosdk.generateAccount())

  const router = useRouter()

  const passphrase = useMemo(
    () => algosdk.secretKeyToMnemonic(account.sk).split(" "),
    [account]
  )

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
      CreateAccountStep.CREATE_ACCOUNT,
      CreateAccountStep.STORE_PASSPHRASE,
      CreateAccountStep.CONFIRM_PASSPHRASE,
      CreateAccountStep.CHOOSE_PIN,
      CreateAccountStep.CHOOSE_NAME,
      CreateAccountStep.CONFIRM_ACCOUNT,
    ],
  })

  switch (step) {
    case CreateAccountStep.CREATE_ACCOUNT:
      return <CreateAccount onBack={onBack} onNext={onNext} />

    case CreateAccountStep.STORE_PASSPHRASE:
      return (
        <StorePassphrase
          onBack={onBack}
          onNext={onNext}
          passphrase={passphrase}
        />
      )

    case CreateAccountStep.CONFIRM_PASSPHRASE:
      return (
        <ConfirmPassphrase
          onBack={onBack}
          onNext={onNext}
          passphrase={passphrase}
        />
      )

    case CreateAccountStep.CHOOSE_PIN:
      return <ChoosePin account={account} onBack={onBack} onNext={onNext} />

    case CreateAccountStep.CHOOSE_NAME:
      return (
        <ChooseName address={account.addr} onBack={onBack} onNext={onNext} />
      )

    case CreateAccountStep.CONFIRM_ACCOUNT:
      return (
        <ConfirmAccount
          address={account.addr}
          onBack={onBack}
          onNext={onNext}
        />
      )
  }
}
