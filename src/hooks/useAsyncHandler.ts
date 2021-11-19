import { toError } from "lib/utils/error"
import { useCallback, useState } from "react"
import { useMountedRef } from "./useMountedRef"

export function useAsyncHandler<P extends any[]>(
  handler: (...args: P) => unknown,
  onError: (error: Error) => void
): [(...args: P) => void, boolean] {
  const [isRunning, setRunning] = useState(false)

  const mountedRef = useMountedRef()

  const asyncHandler = useCallback(
    async (...args: P) => {
      if (!isRunning) {
        try {
          setRunning(true)
          await handler(...args)
        } catch (error) {
          onError(toError(error))
        } finally {
          if (mountedRef.current) {
            setRunning(false)
          }
        }
      }
    },
    [handler, isRunning, mountedRef]
  )

  return [asyncHandler, isRunning]
}
