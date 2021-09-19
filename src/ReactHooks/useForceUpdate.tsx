import { useCallback, useState } from "react"

export default function useForceUpdate(): [object, () => void] {
  const [stateDirty, update] = useState({})
  const forceUpdateHook = useCallback(() => update({}), [])
  return [stateDirty, forceUpdateHook]
}