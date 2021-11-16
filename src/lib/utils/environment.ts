import { AlgoNetwork } from "lib/algo/Network"

export const ALGO_NETWORK = process.env.NEXT_PUBLIC_ALGO_NETWORK as AlgoNetwork

if (!ALGO_NETWORK) {
  throw Error("Missing environment variable ALGO_NETWORK")
}

if (!Object.values(AlgoNetwork).includes(ALGO_NETWORK)) {
  throw Error(`Unknown network: ${ALGO_NETWORK}`)
}
