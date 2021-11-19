import { MutableRefObject, useEffect, useRef } from "react"

export function useMountedRef(): MutableRefObject<boolean> {
  const mountedRef = useRef(true)

  useEffect(
    () => () => {
      mountedRef.current = false
    },
    []
  )

  return mountedRef
}
