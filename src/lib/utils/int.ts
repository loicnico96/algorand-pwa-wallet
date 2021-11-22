export function printDecimals(amount: number, decimals: number): string {
  const radix = BigInt(10)
  let int = BigInt(Math.floor(Math.abs(amount)))
  let str = ""

  for (let i = 0; int > 0 || decimals + 1 > i; i++) {
    if (decimals === i && decimals > 0) {
      str = `.${str}`
    }

    str = (int % radix) + str
    int /= radix
  }

  return amount < 0 ? `-${str}` : str
}

export function readDecimals(str: string, decimals: number): number {
  const match = str.match(/^([+-]?[0-9]+)(?:\.([0-9]+))?/)
  if (match) {
    const intPart = match[1]
    const decPart = match[2] ?? ""
    return Number(intPart + decPart.slice(0, decimals).padEnd(decimals, "0"))
  }

  return Number(0)
}
