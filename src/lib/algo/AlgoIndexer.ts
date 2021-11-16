import algosdk from "algosdk"

import { ALGO_NETWORK } from "lib/utils/environment"

import { AlgoNetwork } from "./Network"

export type Address = string

const ALGO_INDEXER_SERVER =
  ALGO_NETWORK === AlgoNetwork.MAIN
    ? "https://algoexplorerapi.io/idx2/"
    : `https://${ALGO_NETWORK}.algoexplorerapi.io/idx2/`
const ALGO_INDEXER_PORT = ""
const ALGO_INDEXER_TOKEN = ""

export const AlgoIndexer = new algosdk.Indexer(
  ALGO_INDEXER_TOKEN ?? "",
  ALGO_INDEXER_SERVER,
  ALGO_INDEXER_PORT
)
