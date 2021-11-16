import algosdk from "algosdk"

import networks from "config/networks.json"
import { ALGO_NETWORK } from "lib/utils/environment"

export type Address = string

export const AlgoIndexer = new algosdk.Indexer(
  networks[ALGO_NETWORK].algo_indexer_token,
  networks[ALGO_NETWORK].algo_indexer,
  networks[ALGO_NETWORK].algo_indexer_port
)
