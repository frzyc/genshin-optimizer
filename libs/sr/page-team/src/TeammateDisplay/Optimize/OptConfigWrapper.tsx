import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { OptConfig } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/ui'
import { createContext, useMemo } from 'react'

export const OptConfigContext = createContext({
  optConfigId: '',
  optConfig: {} as OptConfig,
})
export default function OptConfigWrapper({
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
