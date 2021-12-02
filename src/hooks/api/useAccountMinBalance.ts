import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/api"

export function useAccountMinBalance(account: AccountInfo | null): number {
  const { config } = useNetworkContext()

  const {
    AppFlatOptInMinBalance,
    AppFlatParamsMinBalance,
    MinBalance,
    SchemaBytesMinBalance,
    SchemaMinBalancePerEntry,
    SchemaUintMinBalance,
  } = config.params

  const MinBalancePerSlice = SchemaMinBalancePerEntry + SchemaBytesMinBalance
  const MinBalancePerUint = SchemaMinBalancePerEntry + SchemaUintMinBalance

  let amount = 0

  if (account?.amount) {
    amount += MinBalance

    account.assets?.forEach(() => {
      amount += MinBalance
    })

    account.createdAssets?.forEach(() => {
      amount += MinBalance
    })

    account.appsLocalState?.forEach(({ schema }) => {
      amount += AppFlatOptInMinBalance
      amount += schema.numByteSlice * MinBalancePerSlice
      amount += schema.numUint * MinBalancePerUint
    })

    account.createdApps?.forEach(({ params }) => {
      amount += AppFlatParamsMinBalance

      const { extraProgramPages, localStateSchema } = params

      if (extraProgramPages) {
        amount += extraProgramPages * AppFlatParamsMinBalance
      }

      if (localStateSchema) {
        amount += localStateSchema.numByteSlice * MinBalancePerSlice
        amount += localStateSchema.numUint * MinBalancePerUint
      }
    })
  }

  return amount
}
