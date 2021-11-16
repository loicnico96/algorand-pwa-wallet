import algosdk from "algosdk"

import networks from "config/networks.json"
import { ALGO_NETWORK } from "lib/utils/environment"

export const AlgoAPI = new algosdk.Algodv2(
  networks[ALGO_NETWORK].algo_api_token,
  networks[ALGO_NETWORK].algo_api,
  networks[ALGO_NETWORK].algo_api_port
)
