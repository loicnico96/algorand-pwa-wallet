import { AppProps } from "next/app"

import { ErrorBoundary } from "components/ErrorBoundary"
import { AddressBookContextProvider } from "context/AddressBookContext"
import { Network, NetworkContextProvider } from "context/NetworkContext"
import { useServiceWorker } from "hooks/useServiceWorker"

export default function App({ Component, pageProps }: AppProps) {
  useServiceWorker()

  return (
    <ErrorBoundary>
      <NetworkContextProvider defaultNetwork={Network.TEST}>
        <AddressBookContextProvider>
          <Component {...pageProps} />
        </AddressBookContextProvider>
      </NetworkContextProvider>
    </ErrorBoundary>
  )
}
