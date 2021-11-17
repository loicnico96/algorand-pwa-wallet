import { DBSchema, IDBPDatabase, openDB } from "idb"

import { Network } from "context/NetworkContext"

const IDB_DATABASE_NAME = "algodb"
const IDB_ACCOUNTS_STORE_NAME = "accounts"

/**
 * Account information stored in local database.
 * @field address - Address on the blockchain
 * @field key (optional) - Encrypted private key (for own accounts only)
 * @field name - Readable name provided by the user
 * @field note (optional) - Additional information provided by the user
 * @field network - Network the account belongs to
 */
export interface Account {
  address: string
  key?: string
  name: string
  note?: string
  network: Network
}

/**
 * IndexedDB schema (v1)
 */
export interface AlgoDBSchemaV1 extends DBSchema {
  accounts: {
    indexes: {
      network: Network
    }
    key: [Network, string]
    value: Account
  }
}

let algoDB: Promise<IDBPDatabase<AlgoDBSchemaV1>>

export async function getAlgoDB(): Promise<IDBPDatabase<AlgoDBSchemaV1>> {
  if (algoDB === undefined) {
    if (typeof window === "undefined") {
      throw Error("IndexedDB is not available on server")
    }

    algoDB = openDB<AlgoDBSchemaV1>(IDB_DATABASE_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(IDB_ACCOUNTS_STORE_NAME, {
          keyPath: ["network", "address"],
        })

        store.createIndex("network", "network")
      },
    })
  }

  return algoDB
}

export async function addAccount(
  network: Network,
  address: string,
  data: Omit<Account, "network" | "address">
): Promise<void> {
  const db = await getAlgoDB()
  await db.add(IDB_ACCOUNTS_STORE_NAME, { ...data, network, address })
}

export async function updateAccount(
  network: Network,
  address: string,
  data: Partial<Omit<Account, "network" | "address">>
): Promise<void> {
  const db = await getAlgoDB()
  const tx = db.transaction(IDB_ACCOUNTS_STORE_NAME, "readwrite")
  const account = await tx.store.get([network, address])
  if (account === undefined) {
    throw Error("Account does not exist")
  }

  await tx.store.put({ ...account, ...data, network, address })
  await tx.done
}

export async function removeAccount(
  network: Network,
  address: string
): Promise<void> {
  const db = await getAlgoDB()
  await db.delete(IDB_ACCOUNTS_STORE_NAME, [network, address])
}

export async function getAccount(
  network: Network,
  address: string
): Promise<Account | undefined> {
  const db = await getAlgoDB()
  return db.get(IDB_ACCOUNTS_STORE_NAME, [network, address])
}

export async function getAccounts(network: Network): Promise<Account[]> {
  const db = await getAlgoDB()
  return db.getAllFromIndex(IDB_ACCOUNTS_STORE_NAME, "network", network)
}
