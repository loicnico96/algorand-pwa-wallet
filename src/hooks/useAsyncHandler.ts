import { toError } from "lib/utils/error"
import { useCallback, useState } from "react"

export function useAsyncHandler<P extends any[], T>(
  handler: (...args: P) => unknown,
  onError?: (error: Error) => void
): [(...args: P) => void, boolean] {
  const [isRunning, setRunning] = useState(false)

  const asyncHandler = useCallback(
    async (...args: P) => {
      if (!isRunning) {
        try {
          setRunning(true)
          await handler(...args)
        } catch (error) {
          if (onError) {
            onError(toError(error))
          }
        } finally {
          setRunning(false)
        }
      }
    },
    [handler, isRunning]
  )

  return [asyncHandler, isRunning]
}
