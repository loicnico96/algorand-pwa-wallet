import algosdk from "algosdk"
import JSONRequest from "algosdk/dist/types/src/client/v2/jsonrequest"

import { toCamelCaseDeep } from "lib/utils/camelcase"

const INT_DECODING = algosdk.IntDecoding.SAFE

export async function getIndexerQuery<T extends Record<string, unknown>>(
  query: JSONRequest<T>
): Promise<T> {
  const result = await query.setIntDecoding(INT_DECODING).do()
  return toCamelCaseDeep(result)
}
