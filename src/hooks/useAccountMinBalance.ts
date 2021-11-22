import { useNetworkContext } from "context/NetworkContext"
import { AccountInfo } from "lib/algo/Account"

export function useAccountMinBalance(account: AccountInfo | null): number {
  const { config } = useNetworkContext()

  let amount = 0

  if (account) {
    amount += config.params.MinBalance

    account.assets?.forEach(() => {
      amount += config.params.MinBalance
    })

    account["created-assets"]?.forEach(() => {
      amount += config.params.MinBalance
    })

    account["apps-local-state"]?.forEach(state => {
      amount += config.params.AppFlatOptInMinBalance

      amount +=
        state.schema["num-byte-slice"] *
        (config.params.SchemaMinBalancePerEntry +
          config.params.SchemaBytesMinBalance)
      amount +=
        state.schema["num-uint"] *
        (config.params.SchemaMinBalancePerEntry +
          config.params.SchemaUintMinBalance)
    })

    account["created-apps"]?.forEach(app => {
      amount += config.params.AppFlatParamsMinBalance

      const schema = app.params["local-state-schema"]

      amount +=
        schema["num-byte-slice"] *
        (config.params.SchemaMinBalancePerEntry +
          config.params.SchemaBytesMinBalance)
      amount +=
        schema["num-uint"] *
        (config.params.SchemaMinBalancePerEntry +
          config.params.SchemaUintMinBalance)
    })
  }

  return amount
}
