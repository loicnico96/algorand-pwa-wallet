import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"

import { useAccountData, useAddressBook } from "context/AddressBookContext"
import { encrypt } from "lib/utils/encryption"
import { replaceParams, Route, RouteParam } from "lib/utils/navigation"

import { ChooseName } from "./ChooseName"
import { ChoosePin } from "./ChoosePin"
import { ConfirmAccount } from "./ConfirmAccount"
import { ConfirmPassphrase } from "./ConfirmPassphrase"
import { SavePassphrase } from "./SavePassphrase"

export enum CreateAccountStep {
  SAVE_PASSPHRASE = 0,
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
  const [step, setStep] = useState(CreateAccountStep.SAVE_PASSPHRASE)

  const { addAccount, updateAccount } = useAddressBook()

  const accountData = useAccountData(account.addr)

  const passphrase = useMemo(() => getPassphrase(account), [account])

  switch (step) {
    case CreateAccountStep.SAVE_PASSPHRASE:
      return (
        <SavePassphrase
          onBack={() => router.push(Route.ACCOUNT_LIST)}
          onNext={() => setStep(step + 1)}
          passphrase={passphrase}
        />
      )

    case CreateAccountStep.CONFIRM_PASSPHRASE:
      return (
        <ConfirmPassphrase
          onBack={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
          passphrase={passphrase}
        />
      )

    case CreateAccountStep.CHOOSE_PIN:
      return (
        <ChoosePin
          onBack={() => setStep(step - 1)}
          onNext={async pin => {
            const key = encrypt(account.sk.join(","), pin)
            if (accountData) {
              await updateAccount(account.addr, { key })
            } else {
              await addAccount(account.addr, { key })
            }
            setStep(step + 1)
          }}
        />
      )

    case CreateAccountStep.CHOOSE_NAME:
      return (
        <ChooseName
          defaultName={accountData?.name}
          defaultNote={accountData?.note}
          onBack={() => setStep(step - 1)}
          onNext={async data => {
            if (accountData) {
              await updateAccount(account.addr, data)
            } else {
              await addAccount(account.addr, data)
            }
            setStep(step + 1)
          }}
        />
      )

    case CreateAccountStep.CONFIRM_ACCOUNT:
      return (
        <ConfirmAccount
          address={account.addr}
          onBack={() => setStep(step - 1)}
          onNext={async () => {
            const url = replaceParams(Route.ACCOUNT_VIEW, {
              [RouteParam.ADDRESS]: account.addr,
            })

            await router.push(url)
          }}
        />
      )
  }
}
