import { decrypt, encrypt } from "./encryption"

describe("encryption", () => {
  const data = "Hello World!"

  it("encrypts and decrypts data", () => {
    expect(decrypt(encrypt(data, "salt"), "salt")).toBe(data)
  })
})
