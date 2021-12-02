import algosdk from "algosdk"
import JSONRequest from "algosdk/dist/types/src/client/v2/jsonrequest"

import { toCamelCaseDeep } from "lib/utils/camelcase"

export async function getIndexerQuery<T extends Record<string, unknown>>(
  query: JSONRequest<T>
): Promise<T> {
  // TODO: Consider algosdk.IntDecoding.MIXED
  const result = await query.setIntDecoding(algosdk.IntDecoding.DEFAULT).do()
  return toCamelCaseDeep(result)
}
