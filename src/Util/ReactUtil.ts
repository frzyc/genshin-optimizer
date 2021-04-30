import { useCallback, useEffect, useState } from "react"

export function useForceUpdate(): [object, () => void] {
  const [stateDirty, update] = useState({})
  const forceUpdateHook = useCallback(() => update({}), [])
  return [stateDirty, forceUpdateHook]
}

export function usePromise<T>(promise: Promise<T> | undefined): T | undefined {
  const [res, setRes] = useState<T | undefined>();
  useEffect(() => {
    let pending = true
    promise?.then(res => pending && setRes(() => res), console.error) ?? setRes(undefined)
    return () => { pending = false }
  }, [promise])
  return res
}
