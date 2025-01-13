import {
  DBLocalStorage,
  SandboxStorage,
} from '@genshin-optimizer/common/database'
import { ZzzDatabase } from '@genshin-optimizer/zzz/db'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { DatabaseContext, type DatabaseContextObj } from '../context'

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const dbIndex = parseInt(localStorage.getItem('zzz_dbIndex') || '1')
  const [databases, setDatabases] = useState(() => {
    localStorage.removeItem('zzz_newTabDetection')
    localStorage.setItem('zzz_newTabDetection', 'debug')
    return ([1, 2, 3, 4] as const).map((index) => {
      if (index === dbIndex) {
        return new ZzzDatabase(index, new DBLocalStorage(localStorage, 'zzz'))
      } else {
        const dbName = `zzz_extraDatabase_${index}`
        const eDB = localStorage.getItem(dbName)
        const dbObj = eDB ? JSON.parse(eDB) : {}
        const db = new ZzzDatabase(index, new SandboxStorage(dbObj, 'zzz'))
        db.toExtraLocalDB()
        return db
      }
    })
  })
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
