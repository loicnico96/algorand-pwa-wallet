import { AppProps } from "next/app"

import { ErrorBoundary } from "components/ErrorBoundary"
import { AddressBookContextProvider } from "context/AddressBookContext"
import { AssetPriceContextProvider } from "context/AssetPriceContext"
import { Network, NetworkContextProvider } from "context/NetworkContext"
import { ToastProvider } from "context/ToastContext"
import { useServiceWorker } from "hooks/useServiceWorker"

export default function App({ Component, pageProps }: AppProps) {
  useServiceWorker()

  return (
    <ErrorBoundary>
      <ToastProvider>
        <NetworkContextProvider defaultNetwork={Network.TEST}>
          <AddressBookContextProvider>
            <AssetPriceContextProvider>
              <Component {...pageProps} />
            </AssetPriceContextProvider>
          </AddressBookContextProvider>
        </NetworkContextProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
