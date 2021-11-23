import { AppProps } from "next/app"
import Modal from "react-modal"

import { ErrorBoundary } from "components/ErrorBoundary"
import { AddressBookContextProvider } from "context/AddressBookContext"
import { AssetPriceContextProvider } from "context/AssetPriceContext"
import { Network, NetworkContextProvider } from "context/NetworkContext"
import { PinModalContextProvider } from "context/PinModalContext"
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
            <AddressBookContextProvider>
              <AssetPriceContextProvider>
                <PinModalContextProvider>
                  <Component {...pageProps} />
                </PinModalContextProvider>
              </AssetPriceContextProvider>
            </AddressBookContextProvider>
          </NetworkContextProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
