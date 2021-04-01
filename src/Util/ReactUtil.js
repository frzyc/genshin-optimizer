import { useCallback, useState } from "react"

export function useForceUpdate() {
  const [, update] = useState()
  const forceUpdateHook = useCallback(() => update({}), [])
  return forceUpdateHook
}