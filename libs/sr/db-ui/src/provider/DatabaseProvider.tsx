import { useDatabases } from '@genshin-optimizer/common/database-ui'
import { SroDatabase } from '@genshin-optimizer/sr/db'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { DatabaseContext, type DatabaseContextObj } from '../context'

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const dbIndex = Number.parseInt(localStorage.getItem('sro_dbIndex') || '1')
  const [databases, setDatabases] = useDatabases(
    SroDatabase,
    dbIndex,
    'sro_newTabDetection',
    'sro'
  )
  const setDatabase = useCallback(
    (index: number, db: SroDatabase) => {
      const dbs = [...databases]
      dbs[index] = db
      setDatabases(dbs)
    },
    [databases, setDatabases]
  )

  const database = databases[dbIndex - 1]
  const dbContextObj: DatabaseContextObj = useMemo(
    () => ({ databases, setDatabases, database, setDatabase }),
    [databases, setDatabases, database, setDatabase]
  )
  return (
    <DatabaseContext.Provider value={dbContextObj}>
      {children}
    </DatabaseContext.Provider>
  )
}
