import algosdk from "algosdk"
import { useRouter } from "next/router"
import { useState } from "react"

import { useAccountData, useAddressBook } from "context/AddressBookContext"
import { encrypt } from "lib/utils/encryption"
import { replaceParams, Route } from "lib/utils/navigation"

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

  const { addAccount, updateAccount } = useAddressBook()

  const accountData = useAccountData(account?.addr ?? null)

  switch (step) {
    case RestoreAccountStep.RESTORE_PASSPHRASE:
      return (
        <RestorePassphrase
          onBack={Route.ACCOUNT_LIST}
          onNext={passphrase => {
            setAccount(algosdk.mnemonicToSecretKey(passphrase.join(" ")))
            setStep(step + 1)
          }}
        />
      )

    case RestoreAccountStep.CHOOSE_PIN:
      return (
        <ChoosePin
          onBack={() => setStep(step - 1)}
          onNext={async pin => {
            if (!account) {
              throw Error("No account")
            }

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

    case RestoreAccountStep.CHOOSE_NAME:
      return (
        <ChooseName
          defaultName={accountData?.name}
          defaultNote={accountData?.note}
          onBack={() => setStep(step - 1)}
          onNext={async data => {
            if (!account) {
              throw Error("No account")
            }

            if (accountData) {
              await updateAccount(account.addr, data)
            } else {
              await addAccount(account.addr, data)
            }

            await router.push(
              replaceParams(Route.ACCOUNT_VIEW, {
                address: account.addr,
              })
            )
          }}
        />
      )

    default:
      return null
  }
}
