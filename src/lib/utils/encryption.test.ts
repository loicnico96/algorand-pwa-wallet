import { decrypt, encrypt } from "./encryption"

describe("encryption", () => {
  const data = "Hello World!"

  it("encrypts and decrypts data", () => {
    const salt = new Date().toString()
    expect(decrypt(encrypt(data, salt), salt)).toBe(data)
  })
})
