import algosdk from "algosdk"

import tinymanContractsV1 from "config/tinyman-contracts-v1.json"
import { NetworkConfig } from "context/NetworkContext"

import { PoolInfo } from "./pool"

export function encodeUint(value: number): number[] {
  const result: number[] = []

  let uint = value

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-bitwise
    const byte = uint & 0x7f
    // eslint-disable-next-line no-bitwise
    uint >>= 7

    if (uint) {
      // eslint-disable-next-line no-bitwise
      result.push(byte | 0x80)
    } else {
      result.push(byte)
      return result
    }
  }
}

export function getPoolLogicSig(
  config: NetworkConfig,
  pool: PoolInfo
): algosdk.LogicSigAccount {
  const values: Record<string, number> = {
    TMPL_ASSET_ID_1: pool.asset1.id,
    TMPL_ASSET_ID_2: pool.asset2.id,
    TMPL_VALIDATOR_APP_ID: config.tinyman.validator_app_id,
  }

  const { contracts } = tinymanContractsV1
  const { bytecode, variables } = contracts.pool_logicsig.logic

  variables.sort((a, b) => a.index - b.index)

  let offset = 0

  const program = Array.from(Buffer.from(bytecode, "base64"))

  for (const variable of variables) {
    const start = variable.index - offset
    const value = values[variable.name]
    const encodedValue = encodeUint(value)
    program.splice(start, variable.length, ...encodedValue)
    offset += variable.length - encodedValue.length
  }

  const bytes = Uint8Array.from(program)

  return new algosdk.LogicSigAccount(bytes)
}
