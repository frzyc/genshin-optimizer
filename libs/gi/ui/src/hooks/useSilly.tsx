import type { SillyContextObj } from '@genshin-optimizer/gi/uidata'
import { useEffect, useMemo, useState } from 'react'
const lsKey = 'silly_optimizer_enabled'

export function useSilly(): SillyContextObj {
  const [silly, setSilly] = useState(!!localStorage.getItem(lsKey))
  useEffect(() => {
    if (silly) localStorage.setItem(lsKey, 'on')
    else localStorage.removeItem(lsKey)
  }, [silly])
  return useMemo(() => ({ silly, setSilly }), [silly])
}
