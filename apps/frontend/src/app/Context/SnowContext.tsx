import { createContext, useEffect, useMemo, useState } from 'react'

export type SnowContextObj = {
  snow: boolean
  setSnow: (s: boolean) => void
}

export const SnowContext = createContext({
  snow: false,
  setSnow: () => {},
} as SnowContextObj)

const lsKey = 'snow_enabled'

export function useSnow(): SnowContextObj {
  const [snow, setSnow] = useState(
    (localStorage.getItem(lsKey) || 'on') === 'on' // on by default for winter season
  )
  useEffect(() => {
    if (snow) localStorage.setItem(lsKey, 'on')
    else localStorage.setItem(lsKey, 'off')
  }, [snow])
  return useMemo(() => ({ snow, setSnow }), [snow])
}
