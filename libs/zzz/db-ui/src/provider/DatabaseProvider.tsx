import { useDatabases } from '@genshin-optimizer/common/database-ui'
import { ZzzDatabase } from '@genshin-optimizer/zzz/db'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { DatabaseContext, type DatabaseContextObj } from '../context'

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const dbIndex = Number.parseInt(localStorage.getItem('zzz_dbIndex') || '1')
  const [databases, setDatabases] = useDatabases(
    ZzzDatabase,
    dbIndex,
    'zzz_newTabDetection',
    'zzz'
  )
  const setDatabase = useCallback(
    (index: number, db: ZzzDatabase) => {
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
