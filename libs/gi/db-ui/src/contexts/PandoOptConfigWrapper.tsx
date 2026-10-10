import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { PandoOptConfig } from '@genshin-optimizer/gi/db'
import { createContext, useMemo } from 'react'
import { useDatabase } from '../hooks'

export const PandoOptConfigContext = createContext({
  optConfigId: '',
  optConfig: {} as PandoOptConfig,
})
export function PandoOptConfigProvider({
  optConfigId,
  children,
}: {
  optConfigId: string
  children: React.ReactNode
}) {
  const database = useDatabase()
  const optConfig = useDataManagerBase(database.pandoOptConfigs, optConfigId)!
  const providerValue = useMemo(
    () => ({ optConfigId, optConfig }),
    [optConfigId, optConfig]
  )
  return (
    <PandoOptConfigContext.Provider value={providerValue}>
      {children}
    </PandoOptConfigContext.Provider>
  )
}
