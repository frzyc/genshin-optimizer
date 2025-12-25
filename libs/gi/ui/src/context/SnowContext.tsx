import { createContext, useEffect, useMemo, useState } from 'react'

export type SnowContextObj = {
  snow: boolean
  setSnow: (s: boolean) => void
}

export const SnowContext = createContext({
  snow: false,
  setSnow: () => {},
} as SnowContextObj)

const lsKey = 'snow_effect_enabled'

export function useSnow(): SnowContextObj {
  const [snow, setSnow] = useState(localStorage.getItem(lsKey) === 'on')
  useEffect(() => {
    if (snow) localStorage.setItem(lsKey, 'on')
    else localStorage.removeItem(lsKey)
  }, [snow])
  return useMemo(() => ({ snow, setSnow }), [snow])
}
