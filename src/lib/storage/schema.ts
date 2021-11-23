export enum AuthType {
  SINGLE = "single",
}

export interface AccountData {
  auth?: AuthType
  name?: string
  note?: string
}
