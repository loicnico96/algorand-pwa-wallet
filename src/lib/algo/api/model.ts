export enum AccountStatus {
  OFFLINE = "Offline",
  ONLINE = "Online",
  // Custom status representing an empty (i.e. not founded) account
  EMPTY = "Empty",
}

export enum SignatureType {
  LOGIC = "lsig",
  MULTI = "msig",
  SINGLE = "sig",
}

export enum TransactionType {
  ASSET_TRANSFER = "axfer",
  TRANSFER = "pay",
}

export interface AppStateValue {
  bytes: string
  type: number
  uint: number
}

export interface AppStateEntry {
  key: string
  value: AppStateValue
}

export interface AppStateSchema {
  numByteSlice: number
  numUint: number
}

export interface AppLocalState {
  id: number
  keyValue?: AppStateEntry[]
  schema: AppStateSchema
}

export interface AppParams {
  approvalProgram: Uint8Array
  clearStateProgram: Uint8Array
  creator: string
  extraProgramPages?: number
  globalState?: AppStateEntry[]
  globalStateSchema?: AppStateSchema
  localStateSchema?: AppStateSchema
}

export interface AppInfo {
  id: number
  params: AppParams
}

export interface AssetParams {
  clawback?: string
  creator: string
  defaultFrozen?: boolean
  decimals: number
  freeze?: string
  manager?: string
  metadataHash?: Uint8Array
  name?: string
  nameB64?: Uint8Array
  reserve?: string
  unitName?: string
  unitNameB64?: Uint8Array
  url?: string
  urlB64?: Uint8Array
  total: number
}

export interface AssetInfo {
  index: number
  params: AssetParams
}

export interface AccountAsset {
  amount: number
  assetId: number
  creator: string
  isFrozen: boolean
}

export interface AccountParticipation {
  selectionParticipationKey: Uint8Array
  voteFirstValid: number
  voteKeyDilution: number
  voteLastValid: number
  voteParticipationKey: Uint8Array
}

export interface AccountInfo {
  address: string
  amount: number
  amountWithoutPendingRewards: number
  appsLocalState?: AppLocalState[]
  appsTotalExtraPages?: number
  appsTotalSchema?: AppStateSchema
  assets?: AccountAsset[]
  authAddr?: string
  createdApps?: AppInfo[]
  createdAssets?: AssetInfo[]
  participation?: AccountParticipation
  pendingRewards: number
  rewardsBase?: number
  rewards: number
  round: number
  sigType?: SignatureType
  status: AccountStatus
}

export interface EncodedSubSig {
  pk: Uint8Array
  s?: Uint8Array
}

export interface EncodedMultiSig {
  v: number
  thr: number
  subsig: EncodedSubSig[]
}

export interface EncodedLogicSig {
  l: Uint8Array
  arg?: Uint8Array[]
  sig?: Uint8Array[]
  msig?: EncodedMultiSig
}

export interface EncodedAppStateSchema {
  nbs: number
  nui: number
}

export interface EncodedAssetParams {
  am?: Uint8Array
  an?: string
  au?: string
  c?: Uint8Array
  dc: number
  df: boolean
  f?: Uint8Array
  m?: Uint8Array
  r?: Uint8Array
  t: number
  un?: string
}

export interface EncodedTransaction {
  aamt?: number
  aclose?: string
  afrz?: boolean
  amt?: number
  apaa?: Uint8Array[]
  apan?: number
  apap?: Uint8Array
  apar?: EncodedAssetParams
  apas?: number[]
  apat?: Uint8Array[]
  apep?: number
  apfa?: number[]
  apgs?: EncodedAppStateSchema
  apid?: number
  apls?: EncodedAppStateSchema
  apsu?: Uint8Array
  arcv?: Uint8Array
  asnd?: Uint8Array
  caid?: number
  close?: string
  fadd?: Uint8Array
  faid?: number
  fee?: number
  fv?: number
  gen: string
  gh: Uint8Array
  grp?: Uint8Array
  lv: number
  lx?: Uint8Array
  nonpart?: boolean
  note?: Uint8Array
  rekey?: Uint8Array
  rcv?: Uint8Array
  selkey?: Uint8Array
  snd: Uint8Array
  type: TransactionType
  votefst?: number
  votekd?: number
  votekey?: Uint8Array
  votelst?: number
  xaid?: number
}

export interface EncodedSignedTransaction {
  lsig?: EncodedLogicSig
  msig?: EncodedMultiSig
  sig?: Uint8Array
  sgnr?: string
  txn: EncodedTransaction
}

export interface PendingTransaction {
  applicationIndex?: number
  assetClosingAmount?: number
  assetIndex?: number
  closeRewards?: number
  closingAmount?: number
  confirmedRound?: number
  innerTxns?: PendingTransaction[]
  logs?: Uint8Array[]
  poolError?: string
  receiverRewards?: number
  senderRewards?: number
  txn: EncodedSignedTransaction
}
