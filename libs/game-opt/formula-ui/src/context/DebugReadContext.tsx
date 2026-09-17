import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Tag } from '@genshin-optimizer/game-opt/engine'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { TagContext } from './TagContext'

export type DebugReadTarget = {
  read: BaseRead
  tag: Tag
}

export type DebugReadContextObj = {
  target: DebugReadTarget | undefined
  setTarget: (target: DebugReadTarget | undefined) => void
}

export const DebugReadContext = createContext<DebugReadContextObj>(
  {} as DebugReadContextObj
)

export function useDebugReadContextValue(): DebugReadContextObj {
  const [target, setTarget] = useState<DebugReadTarget | undefined>()
  return useMemo(() => ({ target, setTarget }), [target])
}

/** Open the debug modal for a read. tag defaults to local `TagContext`. */
export function useSetDebugTarget():
  | ((read: BaseRead, tag?: Tag) => void)
  | undefined {
  const { setTarget } = useContext(DebugReadContext)
  const contextTag = useContext(TagContext)
  const setDebugTarget = useCallback(
    (read: BaseRead, tag?: Tag) => {
      setTarget?.({ read, tag: tag ?? contextTag })
    },
    [setTarget, contextTag]
  )
  return shouldShowDevComponents ? setDebugTarget : undefined
}
