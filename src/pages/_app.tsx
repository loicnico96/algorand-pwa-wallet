import { AppProps } from "next/app"
import Modal from "react-modal"

import { ErrorBoundary } from "components/ErrorBoundary"
import { AddressBookContextProvider } from "context/AddressBookContext"
import { AssetPriceContextProvider } from "context/AssetPriceContext"
import { Network, NetworkContextProvider } from "context/NetworkContext"
import { SecurityContextProvider } from "context/SecurityContext"
import { StorageContextProvider } from "context/StorageContext"
import { ThemeProvider } from "context/theme/ThemeProvider"
import { ToastProvider } from "context/ToastContext"
import { useServiceWorker } from "hooks/useServiceWorker"

Modal.setAppElement("#__next")

export default function App({ Component, pageProps }: AppProps) {
  useServiceWorker()

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <NetworkContextProvider defaultNetwork={Network.TEST}>
            <StorageContextProvider>
              <SecurityContextProvider>
                <AddressBookContextProvider>
                  <AssetPriceContextProvider>
                    <Component {...pageProps} />
                  </AssetPriceContextProvider>
                </AddressBookContextProvider>
              </SecurityContextProvider>
            </StorageContextProvider>
          </NetworkContextProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
