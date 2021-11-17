import { replaceParams } from "./navigation"

describe("replaceParams", () => {
  it("replaces route parameters", () => {
    expect(
      replaceParams("/account/[address]", {
        address: "foo",
      })
    ).toBe("/account/foo")
  })
})
