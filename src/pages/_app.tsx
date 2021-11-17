import { AppProps } from "next/app"

import { Network, NetworkContextProvider } from "context/NetworkContext"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NetworkContextProvider defaultNetwork={Network.TEST}>
      <Component {...pageProps} />
    </NetworkContextProvider>
  )
}
