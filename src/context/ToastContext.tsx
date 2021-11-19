import { ProviderProps } from "./utils"
import { ToastContainer } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"

export function ToastProvider({ children }: ProviderProps) {
  return (
    <>
      <ToastContainer
        closeOnClick
        draggable
        newestOnTop
        pauseOnFocusLoss
        pauseOnHover
        position="bottom-left"
        theme="dark"
      />
      {children}
    </>
  )
}
