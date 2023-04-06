import { createContext, useEffect, useMemo, useState } from 'react'

export type SillyContextObj = {
  silly: boolean
  setSilly: (s: boolean) => void
}

export const SillyContext = createContext({
  silly: false,
  setSilly: () => {},
} as SillyContextObj)

const lsKey = 'silly_optimizer_enabled'

export function useSilly(): SillyContextObj {
  const [silly, setSilly] = useState(!!localStorage.getItem(lsKey))
  useEffect(() => {
    if (silly) localStorage.setItem(lsKey, 'on')
    else localStorage.removeItem(lsKey)
  }, [silly])
  return useMemo(() => ({ silly, setSilly }), [silly])
}
