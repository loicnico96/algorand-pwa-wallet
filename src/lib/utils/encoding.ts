export function decodeBase64(str: string): Buffer {
  return Buffer.from(str, "base64")
}

export function encodeBase64(str: string | Buffer): string {
  const buf = str instanceof Buffer ? str : Buffer.from(str)
  return buf.toString("base64")
}
