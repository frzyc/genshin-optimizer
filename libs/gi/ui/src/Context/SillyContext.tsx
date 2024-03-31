import { createContext, useEffect, useMemo, useState } from 'react'

export type SillyContextObj = {
  silly: boolean
  setSilly: (s: boolean) => void
}

export const SillyContext = createContext({
  silly: false,
  setSilly: () => {},
} as SillyContextObj)

const lsKey = 'silly_2024'

export function useSilly(): SillyContextObj {
  const [silly, setSilly] = useState(
    (localStorage.getItem(lsKey) ?? 'on') === 'on'
  )
  useEffect(() => {
    if (silly) localStorage.setItem(lsKey, 'on')
    else localStorage.setItem(lsKey, 'off')
  }, [silly])
  return useMemo(() => ({ silly, setSilly }), [silly])
}
