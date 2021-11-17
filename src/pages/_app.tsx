import { AppProps } from "next/app"

import { AddressBookContextProvider } from "context/AddressBookContext"
import { Network, NetworkContextProvider } from "context/NetworkContext"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NetworkContextProvider defaultNetwork={Network.TEST}>
      <AddressBookContextProvider>
        <Component {...pageProps} />
      </AddressBookContextProvider>
    </NetworkContextProvider>
  )
}
