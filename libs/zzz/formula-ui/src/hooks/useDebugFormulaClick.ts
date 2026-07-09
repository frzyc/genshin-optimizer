import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Tag } from '@genshin-optimizer/game-opt/engine'
import { DebugReadContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import { useContext, useMemo } from 'react'

/** Opens `DebugReadModal` for a sheet field read when dev components are enabled. */
export function useDebugFormulaClick():
  | ((read: BaseRead, tag: Tag) => void)
  | undefined {
  const { setRead, setTag } = useContext(DebugReadContext)
  return useMemo(() => {
    if (!shouldShowDevComponents) return undefined
    return (read: BaseRead, tag: Tag) => {
      setRead(read)
      setTag(tag)
    }
  }, [setRead, setTag])
}
