import type { MainSubStatKey } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext, useOptConfig } from '@genshin-optimizer/gi/db-ui'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import { forEachNodes } from '@genshin-optimizer/gi/wr'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { optimizeNodesForScaling } from '../util'
import { DataContext } from './DataContext'
type OptTargetContextObj = {
  target: string[] | undefined
  scalesWith: Set<MainSubStatKey>
}
const defOptTargetContextObj = {
  target: undefined,
  scalesWith: new Set(),
} as OptTargetContextObj
export const OptTargetContext = createContext(defOptTargetContextObj)

export function OptTargetWrapper({ children }: { children: ReactNode }) {
  const {
    teamChar: { optConfigId, key: characterKey },
  } = useContext(TeamCharacterContext)

  const buildSetting = useOptConfig(optConfigId)!
  const dataContextValue = useContext(DataContext)
  const optTargetContextObj = useMemo((): OptTargetContextObj => {
    const { statFilters, optimizationTarget } = buildSetting
    if (!optimizationTarget) return defOptTargetContextObj

    const { nodes } = optimizeNodesForScaling(
      dataContextValue.teamData,
      characterKey,
      optimizationTarget,
      statFilters
    )
    if (!nodes) return defOptTargetContextObj

    return {
      target: optimizationTarget,
      scalesWith: getScalesWith(nodes),
    }
  }, [buildSetting, characterKey, dataContextValue.teamData])

  if (!optTargetContextObj) return children
  return (
    <OptTargetContext.Provider value={optTargetContextObj}>
      {children}
    </OptTargetContext.Provider>
  )
}

function getScalesWith(nodes: OptNode[]) {
  const scalesWith = new Set<string>()
  forEachNodes(
    nodes,
    (node) => node.operation === 'read' && scalesWith.add(node.path[1])
  )
  return scalesWith as Set<MainSubStatKey>
}
