import algosdk from "algosdk"

import { decrypt, encrypt } from "./encryption"

export const PIN_LENGTH = 6
export const PIN_REGEX = new RegExp(`^[0-9]{${PIN_LENGTH}}$`)

export const LOCAL_STORAGE_ADDR = "addr"
export const LOCAL_STORAGE_SK = "sk"

export function promptPIN(reason: string): string | null {
  // eslint-disable-next-line no-alert
  const pin = window.prompt(reason)

  if (pin !== null && !pin.match(PIN_REGEX)) {
    throw Error("Invalid PIN")
  }

  return pin
}

export function encryptKey(key: Uint8Array, pin: string): string {
  return encrypt(key.join(","), pin)
}

export function decryptKey(cipher: string, pin: string): Uint8Array {
  try {
    const key = Uint8Array.from(decrypt(cipher, pin).split(",").map(Number))
    algosdk.secretKeyToMnemonic(key) // Additional test for validity
    return key
  } catch (error) {
    throw Error("Invalid PIN")
  }
}

export function addAccount(account: algosdk.Account): boolean {
  const pin = promptPIN("Choose a secret PIN (6 digits):")
  if (pin === null) {
    return false
  }

  window.localStorage.setItem(LOCAL_STORAGE_ADDR, account.addr)
  window.localStorage.setItem(LOCAL_STORAGE_SK, encryptKey(account.sk, pin))
  return true
}

export function changePIN(): boolean {
  const cipher = window.localStorage.getItem(LOCAL_STORAGE_SK)
  if (cipher === null) {
    return false
  }

  const oldPin = promptPIN("Enter your secret PIN (6 digits):")
  if (oldPin === null) {
    return false
  }

  const newPin = promptPIN("Choose a new PIN (6 digits):")
  if (newPin === null) {
    return false
  }

  const key = decryptKey(cipher, oldPin)
  window.localStorage.setItem(LOCAL_STORAGE_SK, encryptKey(key, newPin))
  return true
}

export function removeAccount(): boolean {
  window.localStorage.removeItem(LOCAL_STORAGE_ADDR)
  window.localStorage.removeItem(LOCAL_STORAGE_SK)
  return true
}

export function getAddress(): string | null {
  return window.localStorage.getItem(LOCAL_STORAGE_ADDR)
}

export function withSecretKey(fn: (key: Uint8Array) => void): void {
  const cipher = window.localStorage.getItem(LOCAL_STORAGE_SK)
  if (cipher) {
    const oldPin = promptPIN("Enter your secret PIN (6 digits):")
    if (oldPin) {
      fn(decryptKey(cipher, oldPin))
    }
  }
}
