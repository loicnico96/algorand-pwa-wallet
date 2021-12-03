import algosdk from "algosdk"

import tinymanContractsV1 from "config/tinyman-contracts-v1.json"
import { NetworkConfig } from "context/NetworkContext"
import { signTransactionGroup, TransactionGroup } from "lib/algo/transactions"

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
  pool: PoolInfo,
  config: NetworkConfig
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

export function signPoolTransaction(
  transactionGroup: TransactionGroup,
  pool: PoolInfo,
  config: NetworkConfig
): TransactionGroup {
  const logicSig = getPoolLogicSig(pool, config)
  const logicSigAddress = logicSig.address()

  if (logicSigAddress !== pool.address) {
    throw Error("Invalid transaction")
  }

  return signTransactionGroup(transactionGroup, logicSigAddress, logicSig)
}
