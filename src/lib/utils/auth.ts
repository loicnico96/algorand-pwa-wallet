import algosdk from "algosdk"

import { decrypt, encrypt } from "./encryption"

export const PIN_LENGTH = 6
export const PIN_REGEX = new RegExp(`^[0-9]{${PIN_LENGTH}}$`)

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
