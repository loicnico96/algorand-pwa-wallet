import { AlgoNetwork } from "lib/algo/Network"

if (!process.env.NEXT_PUBLIC_ALGO_NETWORK) {
  throw Error("Missing environment variable ALGO_NETWORK")
}

const SUPPORTED_NETWORKS = Object.values(AlgoNetwork)

if (
  !SUPPORTED_NETWORKS.includes(
    process.env.NEXT_PUBLIC_ALGO_NETWORK as AlgoNetwork
  )
) {
  throw Error(`Unknown network: ${process.env.NEXT_PUBLIC_ALGO_NETWORK}`)
}

export const ALGO_NETWORK = process.env.NEXT_PUBLIC_ALGO_NETWORK as AlgoNetwork
