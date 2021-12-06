import { AppProps } from "next/app"

import { ErrorBoundary } from "components/ErrorBoundary"
import { ModalProvider } from "context/ModalContext"
import { Network, NetworkContextProvider } from "context/NetworkContext"
import { SecurityContextProvider } from "context/SecurityContext"
import { StorageContextProvider } from "context/StorageContext"
import { ThemeProvider } from "context/theme/ThemeProvider"
import { ToastProvider } from "context/ToastContext"
import { useServiceWorker } from "hooks/useServiceWorker"

export default function App({ Component, pageProps }: AppProps) {
  useServiceWorker()

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ModalProvider>
            <NetworkContextProvider defaultNetwork={Network.TEST}>
              <StorageContextProvider>
                <SecurityContextProvider>
                  <Component {...pageProps} />
                </SecurityContextProvider>
              </StorageContextProvider>
            </NetworkContextProvider>
          </ModalProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
