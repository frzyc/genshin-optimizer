import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { OptConfig } from '@genshin-optimizer/zzz/db'
import { createContext, useMemo } from 'react'
import { useDatabaseContext } from './DatabaseContext'

export const OptConfigContext = createContext({
  optConfigId: '',
  optConfig: {} as OptConfig,
})
export function OptConfigProvider({
  optConfigId,
  children,
}: {
  optConfigId: string
  children: React.ReactNode
}) {
  const { database } = useDatabaseContext()
  const optConfig = useDataManagerBase(database.optConfigs, optConfigId)!
  const providerValue = useMemo(
    () => ({ optConfigId, optConfig }),
    [optConfigId, optConfig]
  )
  return (
    <OptConfigContext.Provider value={providerValue}>
      {children}
    </OptConfigContext.Provider>
  )
}
