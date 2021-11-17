import { replaceParams } from "./navigation"

describe("replaceParams", () => {
  it("replaces route parameters", () => {
    expect(
      replaceParams("/route/[foo]/foo/[bar]", {
        foo: "bar",
        bar: "baz",
      })
    ).toBe("/route/bar/foo/baz")
  })
})
