import { createContext, useEffect, useMemo, useState } from 'react'

export type SillyContextObj = {
  silly: boolean
  setSilly: (s: boolean) => void
}

export const SillyContext = createContext({
  silly: false,
  setSilly: () => {},
} as SillyContextObj)

const lsKey = 'sr_optimizer_enabled'

export function useSilly(): SillyContextObj {
  const [silly, setSilly] = useState(!localStorage.getItem(lsKey))
  useEffect(() => {
    if (silly) localStorage.removeItem(lsKey)
    else localStorage.setItem(lsKey, 'off')
  }, [silly])
  return useMemo(() => ({ silly, setSilly }), [silly])
}
