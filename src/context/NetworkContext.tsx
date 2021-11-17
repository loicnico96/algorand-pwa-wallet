import { AssetInfo } from "lib/algo/Asset"
import { ReactNode, useContext, useState } from "react"
import networks from "config/networks.json"
import { createEmptyContext } from "lib/utils/context"
import algosdk from "algosdk"

export enum Network {
  MAIN = "mainnet",
  TEST = "testnet",
}

export interface NetworkConfig {
  algo_api: {
    port: string
    token: string
    url: string
  }
  algo_indexer: {
    port: string
    token: string
    url: string
  }
  native_asset: AssetInfo
  params: {
    AppFlatOptInMinBalance: number
    AppFlatParamsMinBalance: number
    MaxAppArgs: number
    MaxAppProgramLen: number
    MaxAppTotalArgLen: number
    MaxAppsCreated: number
    MaxAppsOptedIn: number
    MaxAssetNameBytes: number
    MaxAssetUnitNameBytes: number
    MaxAssetURLBytes: number
    MaxAssetsPerAccount: number
    MaxGlobalSchemaEntries: number
    MaxLocalSchemaEntries: number
    MaxTxGroupSize: number
    MaxTxnBytesPerBlock: number
    MaxTxnLife: number
    MaxTxnNoteBytes: number
    MinBalance: number
    MinTxnFee: number
    SchemaBytesMinBalance: number
    SchemaMinBalancePerEntry: number
    SchemaUintMinBalance: number
  }
  prices_api: {
    url: string
  }
  tinyman: {
    validator_app_id: number
  }
}

export interface NetworkContextValue {
  api: algosdk.Algodv2
  config: NetworkConfig
  indexer: algosdk.Indexer
  network: Network
  setNetwork: (network: Network) => void
}

export interface NetworkContextProviderProps {
  children: ReactNode
  defaultNetwork: Network
}

export const NetworkContext =
  createEmptyContext<NetworkContextValue>("NetworkContext")

export function NetworkContextProvider({
  children,
  defaultNetwork,
}: NetworkContextProviderProps) {
  const [network, setNetwork] = useState(defaultNetwork)

  const config = networks[network]

  const api = new algosdk.Algodv2(
    config.algo_api.token,
    config.algo_api.url,
    config.algo_api.port
  )

  const indexer = new algosdk.Indexer(
    config.algo_indexer.token,
    config.algo_indexer.url,
    config.algo_indexer.port
  )

  const value: NetworkContextValue = {
    api,
    config,
    indexer,
    network,
    setNetwork,
  }

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  )
}

export function useNetworkContext(): NetworkContextValue {
  return useContext(NetworkContext)
}
