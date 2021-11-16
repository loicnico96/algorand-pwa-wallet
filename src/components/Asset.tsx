export type AssetProps = {
  amount: number
  clawback?: boolean
  decimals: number
  freeze?: boolean
  frozen?: boolean
  name: string
  price: number
  unit?: string
  url?: string
  verified?: boolean
}

export function Asset(props: AssetProps) {
  const data = {
    ...props,
    amount: props.amount / 10 ** props.decimals,
    value: (props.price * props.amount) / 10 ** props.decimals,
  }

  return <pre>{JSON.stringify(data, undefined, 2)}</pre>
}
