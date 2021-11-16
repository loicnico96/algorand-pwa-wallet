import Crypto from "crypto-js"

export function encrypt(data: string, salt: string): string {
  return Crypto.AES.encrypt(data, salt).toString()
}

export function decrypt(cipher: string, salt: string): string {
  return Crypto.AES.decrypt(cipher, salt).toString(Crypto.enc.Utf8)
}
