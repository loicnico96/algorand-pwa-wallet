export function decodeBase64(str: string): string {
  return Buffer.from(str, "base64").toString()
}

export function encodeBase64(str: string): string {
  return Buffer.from(str).toString("base64")
}
