import { useCallback, useState } from "react"

export default function useBoolState(initial: boolean = false) {
  const [bool, setBool] = useState(initial)
  const onTrue = useCallback(() => setBool(true), [setBool],)
  const onFalse = useCallback(() => setBool(false), [setBool],)
  return [bool, onTrue, onFalse] as [boolean, () => void, () => void]
}
