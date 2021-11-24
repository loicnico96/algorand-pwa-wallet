export enum AuthType {
  SINGLE = "single",
}

export interface ContactData {
  auth?: AuthType
  name?: string
  note?: string
}

export interface Contacts {
  [address: string]: ContactData
}

export function getContactName(address: string, data: ContactData): string {
  return data.name ?? address
}
